import { styled } from "@mui/material/styles";
import { Link } from "react-router-dom";
import logo from "/src/assets/images/logounivalle.svg";

const HeaderContainer = styled("header")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  height: "90px",
  position: "fixed",
  top: 0,
  left: 0,
  zIndex: 1000,
  backgroundColor: "#e3e4e5",
  boxShadow: "0px 14px 20px -17px rgba(66, 68, 90, 1)",
  padding: "0 10px",
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    height: "auto",
    padding: "10px",
  },
}));

const TitleContainer = styled("div")(({ theme }) => ({
  position: "absolute",
  left: "50%",
  transform: "translateX(-50%)",
  whiteSpace: "nowrap",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  flexGrow: 1,
  [theme.breakpoints.down("sm")]: {
    position: "static",
    transform: "none",
    marginTop: "5px",
  },
}));

const Title = styled("div")(({ theme }) => ({
  fontWeight: 600,
  fontSize: "30px",
  color: "#423b3b",
  fontFamily: "Helvetica, sans-serif",
  [theme.breakpoints.down("sm")]: {
    fontSize: "20px",
    textAlign: "center",
  },
  [theme.breakpoints.down("xs")]: {
    fontSize: "18px",
  },
}));

const UserName = styled("div")(({ theme }) => ({
  fontWeight: 400,
  fontSize: "18px",
  color: "#6b6b6b",
  marginTop: "-5px",
  [theme.breakpoints.down("sm")]: {
    fontSize: "14px",
    textAlign: "center",
  },
}));

const Logo = styled("div")(({ theme }) => ({
  paddingLeft: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  img: {
      height: "auto",
      maxHeight: "50px",
      [theme.breakpoints.down("sm")]: {
        maxHeight: "35px",
      },
      [theme.breakpoints.down("xs")]: {
        maxHeight: "25px"
    },
  },
}));

const capitalizeWords = (str) => {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const Header = ({ userData }) => {
  return (
    <HeaderContainer role="navegación" aria-label="Navegación Principal">
      <Logo>
        <Link to="/" alt="Logo Universidad del Valle" aria-label="Homepage de Sistema Siac">
          <img src={logo} loading="lazy" alt="Logo Universidad del Valle" />
        </Link>
      </Logo>
      <TitleContainer>
        <Title>Solicitud Actividades de Extensión</Title>
        {userData && <UserName>{`${capitalizeWords(userData.name)}`}</UserName>}
      </TitleContainer>
    </HeaderContainer>
  );
};

export default Header;
