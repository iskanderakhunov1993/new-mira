import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpenText, Clock3, ShieldAlert } from "lucide-react";
import { getKnowledgeArticle, knowledgeArticles } from "@/lib/knowledge-library";

export function generateStaticParams() {
  return knowledgeArticles.map((article) => ({ id: article.id }));
}

export default async function KnowledgeArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = getKnowledgeArticle(id);
  if (!article) notFound();

  return <main className="knowledge-article-page"><article className="knowledge-article-shell">
    <header className="knowledge-article-top"><Link href="/knowledge" aria-label="Вернуться в библиотеку"><ArrowLeft /></Link><span>Библиотека Mira</span><i><BookOpenText /></i></header>
    <div className="article-draft-label">Черновик · текст-заглушка</div>
    <p className="article-breadcrumb">{article.category}</p>
    <h1>{article.title}</h1>
    <div className="article-read-time"><Clock3 /> {article.time} чтения</div>
    <p className="article-lead">Этот материал сохранён в структуре библиотеки Mira и ожидает медицинской редакции. Ниже размещён временный текст для проверки дизайна и пользовательского сценария.</p>
    <section><h2>Коротко о теме</h2><p>Здесь будет понятное введение в тему «{article.title.toLowerCase()}». Текст объяснит основные понятия простыми словами, поможет разобраться в наблюдениях и отделить распространённые варианты от ситуаций, требующих внимания.</p><p>Будущая версия статьи будет подготовлена по надёжным медицинским источникам и проверена профильным специалистом. Формулировки будут нейтральными, без постановки диагноза по отдельному симптому или данным календаря.</p></section>
    <section><h2>Что полезно отмечать</h2><p>В этом разделе появится список наблюдений, которые можно сохранить в Mira: дата, продолжительность, интенсивность, сопутствующие симптомы и влияние на повседневную жизнь. Несколько последовательных отметок обычно полезнее одного отдельного наблюдения.</p></section>
    <section><h2>Когда обсудить с врачом</h2><p>Здесь будут перечислены признаки, при которых стоит обратиться за профессиональной консультацией. Рекомендации будут учитывать выраженность симптомов, их повторяемость и изменения относительно привычного состояния пользователя.</p></section>
    <aside><ShieldAlert /><div><strong>Статья пока не является медицинским материалом</strong><p>Это редакционная заглушка. Не используйте её для диагностики или выбора лечения. При резком ухудшении самочувствия обратитесь за медицинской помощью.</p></div></aside>
    <footer><Link href="/knowledge"><ArrowLeft />Все статьи</Link><span>Mira · образовательная библиотека</span></footer>
  </article></main>;
}
