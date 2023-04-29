import { Link, Outlet } from 'react-router-dom'

const Layout = () => {
  return (
    <section>
      <ul>
        <li>
          <Link to="/">page1</Link>
        </li>
        <li>
          <Link to="/page2">page2</Link>
        </li>
        <li>
          <Link to="/page3">page3</Link>
        </li>
      </ul>
      <Outlet />
    </section>
  )
}
export default Layout
