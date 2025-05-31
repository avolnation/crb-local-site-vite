import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
  return (
    <nav>
      <h1>Отечные сорта морозостойкого грецкого ореха</h1>
      <p>Индивидуальный подбор саженцев для различных климатических зон</p>
      <div className="buttons">
        <Link to="/"><button className="nav-button">Оставить заявку</button></Link>
        <Link to="/applications"><button className="nav-button">Заявки</button></Link>
        <Link to="/check-mark"><button className="nav-button">Проверить отметку</button></Link>
        <Link to="/digital-signatures"><button className="nav-button">Электронные цифровые подписи</button></Link>
      </div>
    </nav>
  );
};

export default Navbar;