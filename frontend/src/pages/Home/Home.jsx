import './Home.css';

const categories = [
  'Refrigerators',
  'Washing Machines',
  'Vacuum Cleaners',
  'Televisions',
  'Kitchen Appliances',
  'Air Conditioners',
];

function Home() {
  return (
    <main className="home">

      <section className="hero">
        <div className="hero__content">
          <span className="hero__label">NEXORA STORE</span>

          <h1>
            Everything for
            <br />
            your home
          </h1>

          <p>
            Modern home appliances for a comfortable
            and convenient lifestyle.
          </p>

          <a href="/catalog" className="hero__button">
            Shop now
          </a>
        </div>
      </section>

      <section className="categories">
        <div className="section-header">
          <h2>Shop by category</h2>
          <a href="/catalog">View all</a>
        </div>

        <div className="categories__grid">
          {categories.map((category) => (
            <a
              href="/catalog"
              className="category-card"
              key={category}
            >
              <div className="category-card__image">
                Image
              </div>

              <h3>{category}</h3>

              <span>Explore →</span>
            </a>
          ))}
        </div>
      </section>

    </main>
  );
}

export default Home;