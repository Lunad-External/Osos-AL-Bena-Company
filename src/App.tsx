import { Header, Footer } from "./components/Shell";
import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { Catalog } from "./pages/Catalog";
import { ProductDetail } from "./pages/ProductDetail";
import { Contact } from "./pages/Contact";
import { CataloguePage } from "./pages/CataloguePage";
import { NotFound } from "./pages/NotFound";
import { products } from "./catalog";
export function App({ path }: { path: string }) {
  const product = products.find((p) => path === `/products/${p.slug}/`);
  const page =
    path === "/" ? (
      <Home />
    ) : path === "/about/" ? (
      <About />
    ) : path === "/products/" ? (
      <Catalog />
    ) : path === "/catalogue/" ? (
      <CataloguePage />
    ) : path === "/contact/" ? (
      <Contact />
    ) : product ? (
      <ProductDetail product={product} />
    ) : (
      <NotFound />
    );
  return (
    <>
      <Header path={path} />
      <main id="main">{page}</main>
      <Footer />
    </>
  );
}
