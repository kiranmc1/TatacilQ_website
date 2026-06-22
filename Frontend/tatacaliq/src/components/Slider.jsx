import './Slider.css'

let images=["https://ctfassetsprod.tatacliq.com/?url=https://images.ctfassets.net/69qx72t49ip2/1dQCa1Q98993x5XsKhTjDk/6d4923845509ed6951d5c7c7dd0d2c42/WEB_Hero_Banner_1440x450_Menswear_14052026__1_.png",
    "https://ctfassetsprod.tatacliq.com/?url=https://images.ctfassets.net/69qx72t49ip2/RfbYn7Sv7dUpxalnUKoz2/b933a754f1bb1f93134ce9baa0a1396c/WEB_Hero_Banner_1440x450_Ethnic_Wear_14052026.png",
    "https://ctfassetsprod.tatacliq.com/?url=https://images.ctfassets.net/69qx72t49ip2/4O5PQlE0tsSONcDkIx0IRB/a63eb24489713c29fd7af9a93c6c9101/WEB_Hero_Banner_1440x450_Beauty_14052026.png",
    "https://ctfassetsprod.tatacliq.com/?url=https://images.ctfassets.net/69qx72t49ip2/5DvbhsNqwEMWvYFGKyvOpx/9d0f1762cb7ed709004fe1af409aabc5/WEB_Hero_Banner_1440x450_Lingerie_14052026.png",
    "https://ctfassetsprod.tatacliq.com/?url=https://images.ctfassets.net/69qx72t49ip2/7pi1OeP6pnK3ahP8hJEd0U/e76914dae71d46f688ec2c2ccb1f724d/WEB_Hero_Banner_1440x450_Watches_14052026.png",
    "https://ctfassetsprod.tatacliq.com/?url=https://images.ctfassets.net/69qx72t49ip2/7bxluRJZV78c0PNmAMg4WT/6d6ddb49cfa324bb2b5193b1dfac9455/WEB_Hero_Banner_1440x450_Sports_Shoes_14052026.png"
]

function Slider(){
return(
        <>
    <div
      id="myCarousel"
      className="carousel slide"
      data-bs-ride="carousel"
      data-bs-interval="3000"
    >
      <div className="carousel-inner">

        {images.map((img, index) => (
          <div
            className={`carousel-item ${index === 0 ? "active" : ""}`}
            key={index}
          >
            <img
              src={img}
              className="d-block w-100"
              alt={`slide-${index}`}
            />
          </div>
        ))}

      </div>
      <button
        className="carousel-control-prev"
        type="button"
        data-bs-target="#myCarousel"
        data-bs-slide="prev"
      >
        <span className="carousel-control-prev-icon" />
        <span className="visually-hidden">Previous</span>
      </button>

      <button
        className="carousel-control-next"
        type="button"
        data-bs-target="#myCarousel"
        data-bs-slide="next"
      >
        <span className="carousel-control-next-icon" />
        <span className="visually-hidden">next</span>
      </button>
    </div>
      </>
)
}
export default Slider