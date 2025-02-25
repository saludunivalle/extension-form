import Header from './Header';

function Layout({ children, userData }) {
  return (
    <div>
      <Header userData = {userData} />
      {children}
    </div>
  );
}

export default Layout;
