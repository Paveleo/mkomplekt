// покроет "@/images", "../images", "../../images" и т.п.
declare module '*/images' {
  const Images: Record<string, string>;
  export default Images;
}
