import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="header__container">

        <a href="/" className="header__logo">
          NEXORA
        </a>

        <nav className="header__nav">
          <a href="/catalog" className="header__catalog-link">
            Catalog
          </a>
          <a href="/searchbar" className="header__searchbar-link">
            Searchbar
          </a>
        </nav>

        <div className="header__actions">
          <button className="header__search" aria-label="Search">
            🔍
          </button>

         {/*  <button className="header__account" aria-label="Account">
            👤
          </button> */}

          <button className="header__cart" aria-label="Cart">
            🛒
          </button>
        </div>

      </div>
    </header>
  );
}

export default Header;