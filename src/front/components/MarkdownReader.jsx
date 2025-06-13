import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import he from "he";



export const MarkdownReader = ({ text, sender }) => {


    return (
        <section className={`messages ${sender}`}>
            <article className="container-fluid">
                <Markdown children={he.decode(String(text || ""))} remarkPlugins={[remarkGfm]} />
            </article>
        </section>
    )
}