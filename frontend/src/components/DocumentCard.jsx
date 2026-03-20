export default function DocumentCard({ doc }) {
    return (
        <div className="card">
            <div className="card-top">
                <div>
                    <h3>{doc.title}</h3>
                    <p className="meta">
                        {doc.time} • {doc.size}
                    </p>
                </div>

                <span className="status">{doc.status}</span>
            </div>

            <p className="description">{doc.description}</p>

            <ul className="details">
                {doc.details.map((detail, index) => (
                    <li key={index}>{detail}</li>
                ))}
            </ul>

            <div className="card-actions">
                <button>Simplificar</button>
                <button>Resumir</button>
            </div>
        </div>
    );
}