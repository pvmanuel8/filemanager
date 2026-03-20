export default function Header({ totalfiles }) {
    return (
        <div className="header">
            <div>
                <h1>GestorIA</h1>
                <p>Bienvenido a tu gestor de archivos inteligente</p>
            </div>
            <div className="counter-box">
                <span>Total</span>
                <strong>{totalfiles}</strong>
            </div>
        </div>
    )
}