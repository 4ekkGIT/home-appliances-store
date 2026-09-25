import './Header.css';

function Header() {
  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid header__container">

        <a className="navbar-brand" href="/">
          NEXORA
        </a>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className="collapse navbar-collapse"
          id="navbarContent"
        >
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">

            {/* <li className="nav-item">
              <a className="nav-link active" href="/">
                Главная
              </a>
            </li> */}

            <li className="nav-item">
              <a className="nav-link" href="/catalog">
                Каталог
              </a>
            </li>

          </ul>

          <form className="d-flex header__searchbar" role="search">
            <input
              className="form-control me-2"
              type="search"
              placeholder="Я хочу найти..."
              aria-label="Search"
            />

            <button
              className="btn btn-outline-success"
              type="submit"
            >
              Поиск
            </button>
          </form>

          <div className="header__actions">

            <button className="btn ms-3" type="button">
            <img src="src/assets/headerimgs/icons8-сердце-48.png" alt="Cart" />
            </button>

          <button className="btn ms-3" type="button">
            <img src="src/assets/headerimgs/icons8-корзина-32.png" alt="Cart" />
          </button>

          <button className="btn ms-3" type="button">
            <img src="src/assets/headerimgs/icons8-пользователь-48.png" alt="Cart" />
          </button>
          </div>

        </div>
      </div>
    </nav>
  );
}

export default Header;