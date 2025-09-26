import CategoryCard from '@/components/cards/CategoryCard';
import { useRootCategories } from '@/hooks/useCategories';
import s from './CatalogPage.module.css';

function NoteTile() {
  return (
    <div className={s.note}>
      <p className={s.noteLg}>
        Там, где <u>стиль встречает функциональность</u>
      </p>
      <p className={s.noteSm}>
        Больше, чем мебель — <u>ваше пространство</u>.
      </p>
    </div>
  );
}

export default function CatalogPage() {
  const { data } = useRootCategories();

  const cards = (data ?? []).slice(0, 7);

  const mojkiIndex = cards.findIndex((c: any) => {
    const t = (c?.title || '').toLowerCase();
    const s = (c?.slug  || '').toLowerCase();
    return t.includes('мойки') || s.includes('mojki') || s.includes('sink') || s.includes('sinks');
  });

  const insertAt = mojkiIndex >= 0 ? mojkiIndex + 1 : Math.min(cards.length, 6);

  const withNote: (any | { _type: 'note' })[] = [...cards];
  withNote.splice(insertAt, 0, { _type: 'note' });

  return (
    <section className={s.wrap}>
      <h1 className={s.title}>Наш<br/>Каталог</h1>

      <div className={s.grid}>
        {withNote.map((item, idx) => {
          if ((item as any)?._type === 'note') {
            return (
              <div key={`note-${idx}`} className={`${s.cell} ${s.cellShort}`}>
                <NoteTile />
              </div>
            );
          }
          return (
            <div key={(item as any).id} className={`${s.cell} ${idx < 4 ? s.cellTall : s.cellShort}`}>
              <CategoryCard item={item} />
            </div>
          );
        })}
      </div>
    </section>
  );
}
