import t from "../locales/en.json";
import { Breadcrumb } from "../components/UI";
export function CataloguePage() {
  return (
    <section className="page-intro container catalogue-placeholder">
      <Breadcrumb name={t.common.catalogue} />
      <div className="section-heading">
        <h1>{t.common.catalogue}</h1>
      </div>
    </section>
  );
}
