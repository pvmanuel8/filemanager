export default function Sidebar() {
    return (
        <aside className="sidebar">
            <div>
                <div className="brand">
                    <div className="brand-logo">
                        <img className="logo-img" src="src/assets/img/logo.png" alt="GestorIA" />
                        <h1>GestorIA</h1>

                    </div>
                </div>
            </div>

            <nav className="menu">
                <button className="menu-item">Dashboard</button>
                <button className="menu-item active">Documentos</button>
                <button className="menu-item">Chat Global</button>
                <button className="menu-item">Buzón IA</button>
                <button className="menu-item">Empresas</button>
                <button className="menu-item">Simplificador</button>
            </nav>

            <div className="sidebar-bottom">
                <button className="menu-item">Ajustes</button>
                <div className="user-box">
                    <div className="avatar">M</div>
                    <div>
                        <strong>Manu Piñeiro</strong>
                        <p>Admin</p>
                    </div>
                </div>
            </div>
        </aside>

    )
}