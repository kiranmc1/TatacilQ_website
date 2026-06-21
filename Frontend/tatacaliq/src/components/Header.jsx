import './Header.css'

const navItems = ['Home', 'About', 'Services', 'Contact']

function Header() {
  return (
   
   <>
    <div className='logo-handler'>
        <div className='logo'></div>
        <div className='Header-nav'><nav className="navbar navbar-expand-lg navbar-light bg-black">
  <div className="container-fluid">
    <a className="navbar-brand text-white" href="#">Navbar</a>
    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span className="navbar-toggler-icon"></span>
    </button>
    <div className="collapse navbar-collapse" id="navbarSupportedContent">
      <ul className="navbar-nav me-auto mb-2 mb-lg-0">
        <li className="nav-item">
          <a className="nav-link active text-white" aria-current="page" href="#">Home</a>
        </li>
        <li className="nav-item">
          <a className="nav-link text-white" href="#">CLIQ Cash</a>
        </li>
         <li className="nav-item">
          <a className="nav-link text-white" href="#">Gift Card</a>
        </li>
         <li className="nav-item">
          <a className="nav-link text-white" href="#">CLIQ Care</a>
        </li>
         <li className="nav-item">
          <a className="nav-link text-white" href="#">Track Orders</a>
        </li>
        <li className="nav-item dropdown text-white">
          <a className="nav-link dropdown-toggle text-white">
            Sign in/ Sign Up
          </a>
          <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
            <li><a className="dropdown-item" href="#">Action</a></li>
            <li><a className="dropdown-item" href="#">Another action</a></li>
            <li><hr className="dropdown-divider"/></li>
            <li><a className="dropdown-item" href="#">Something else here</a></li>
          </ul>
        </li>
      </ul>
      
    </div>
  </div>
</nav></div>
        <div>header3</div>
    </div>   
   </>
  )
}

export default Header
