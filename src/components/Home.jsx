import React from 'react';
import { Link } from 'react-router-dom';
import { FaPen, FaList, FaCheck, FaKey, FaPrint } from 'react-icons/fa';
import '../styles/Home.css';

const Home = () => {
  return (
    <div className="home">
      <div className="header">
        <h1>Локальный сайт Буда-Кошелёвской ЦРБ</h1>
        <p>Всё необходимое - в одном месте</p>
      </div>
      <div className="cards-container">
        <Link to="/application-form" className="card-link">
          <div className="card" style={{ backgroundColor: '#E8F5E9' }}>
            <div className="card-content">
              <div className="card-icon" style={{ backgroundColor: '#4CAF50' }}>
                <FaPen/>
              </div>
              <div className="card-text">
                <h3>Оставить заявку</h3>
                <p>Форма для подачи заявки для устранения неполадок</p>
              </div>
            </div>
            <button className="card-button">
              Перейти <span className="arrow">→</span>
            </button>
          </div>
        </Link>
        <Link to="/applications" className="card-link">
          <div className="card" style={{ backgroundColor: '#E3F2FD' }}>
            <div className="card-content">
              <div className="card-icon" style={{ backgroundColor: '#2196F3' }}>
                <FaList/>
              </div>
              <div className="card-text">
                <h3>Заявки</h3>
                <p>Отслеживание статуса заявок</p>
              </div>
            </div>
            <button className="card-button">
              Перейти <span className="arrow">→</span>
            </button>
          </div>
        </Link>
        <Link to="/check-mark" className="card-link">
          <div className="card" style={{ backgroundColor: '#FFF3E0' }}>
            <div className="card-content">
              <div className="card-icon" style={{ backgroundColor: '#FF9800' }}>
                <FaCheck/>
              </div>
              <div className="card-text">
                <h3>Проверить отметку</h3>
                <p>Проверка отметки в системе чипования</p>
              </div>
            </div>
            <button className="card-button">
              Перейти <span className="arrow">→</span>
            </button>
          </div>
        </Link>
        <Link to="/digital-signatures" className="card-link">
          <div className="card" style={{ backgroundColor: '#FFEBEE' }}>
            <div className="card-content">
              <div className="card-icon" style={{ backgroundColor: '#F44336' }}>
                <FaKey/>
              </div>
              <div className="card-text">
                <h3>ЭЦП</h3>
                <p>Управление ЭЦП для администраторов</p>
              </div>
            </div>
            <button className="card-button">
              Перейти <span className="arrow">→</span>
            </button>
          </div>
        </Link>
        <Link to="/cartridges" className="card-link">
          <div className="card" style={{ backgroundColor: '#FFF3ED' }}>
            <div className="card-content">
              <div className="card-icon" style={{ backgroundColor: '#e38500' }}>
                <FaPrint/>
              </div>
              <div className="card-text">
                <h3>Картриджи</h3>
                <p>Отслеживание остатков и дат замены</p>
              </div>
            </div>
            <button className="card-button">
              Перейти <span className="arrow">→</span>
            </button>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Home;