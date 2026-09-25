import './Home.css';

import iphone18pro from '../../assets/homeimgs/iphone18pro.png';
import applewatch from '../../assets/homeimgs/applewatch.png';
import samsungtv from '../../assets/homeimgs/samsungtv.png';
import airpods5 from '../../assets/homeimgs/airpods5.png';

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

          <div
            id="carouselExampleAutoplaying"
            className="carousel slide"
            data-bs-ride="carousel"
          >

            <div className="carousel-inner">

              <div className="carousel-item active">
                <img
                  src={iphone18pro}
                  className="d-block w-100"
                  alt="iPhone 18 Pro"
                />
              </div>

              <div className="carousel-item">
                <img
                  src={applewatch}
                  className="d-block w-100"
                  alt="Featured home appliances"
                />
              </div>

              <div className="carousel-item">
                <img
                  src={samsungtv}
                  className="d-block w-100"
                  alt="Featured home appliances"
                />
              </div>

              <div className="carousel-item">
                <img
                  src={airpods5}
                  className="d-block w-100"
                  alt="Featured home appliances"
                />
              </div>

            </div>

            <button
              className="carousel-control-prev"
              type="button"
              data-bs-target="#carouselExampleAutoplaying"
              data-bs-slide="prev"
            >
              <span
                className="carousel-control-prev-icon"
                aria-hidden="true"
              />
              <span className="visually-hidden">
                Previous
              </span>
            </button>

            <button
              className="carousel-control-next"
              type="button"
              data-bs-target="#carouselExampleAutoplaying"
              data-bs-slide="next"
            >
              <span
                className="carousel-control-next-icon"
                aria-hidden="true"
              />
              <span className="visually-hidden">
                Next
              </span>
            </button>

          </div>

        </div>
      </section>

      <section className="categories">



      </section>

    </main>
  );
}

export default Home;