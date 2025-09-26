import Papa from 'papaparse'
import { supabase } from '@/lib/supabase'

export default function ImportPage(){
  const onFile = async (file: File) => {
    Papa.parse(file, {
      header:true, skipEmptyLines:true,
      complete: async ({data}: any)=>{
        for (const row of data){
          const { data:cat } = await supabase.from('categories').select('id').eq('slug', row.category_slug).single()
          if(!cat) continue
          const { data:prod, error } = await supabase.from('products').insert([{
            title: row.title, sku: row.sku, category_id: cat.id,
            price: row.price? Number(row.price):null,
            thickness: row.thickness? Number(row.thickness):null,
            color: row.color||null, material: row.material||null,
            description: row.description||null,
            is_published: row.is_published?.toString().toLowerCase() !== 'false'
          }]).select().single()
          if(error) { console.warn(error.message); continue; }

          for (const key of ['image1','image2','image3']){
            const url = row[key]; if(!url) continue
            await supabase.from('product_images').insert([{ product_id: prod.id, url, sort: key==='image1'?0:key==='image2'?1:2 }])
          }
        }
        alert('Импорт завершён')
      }
    })
  }
  return (
    <div>
      <h1>Импорт CSV</h1>
      <p>Формат: title,sku,category_slug,price,thickness,color,material,description,is_published,image1,image2,image3</p>
      <input type="file" accept=".csv" onChange={e=>e.target.files && onFile(e.target.files[0])}/>
    </div>
  )
}
