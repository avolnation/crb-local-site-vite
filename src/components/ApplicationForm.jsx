import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/ApplicationForm.css';

const ApplicationForm = () => {
  const [formData, setFormData] = useState({
    subdivision: '',
    description: '',
    contactInfo: '',
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalSuccess, setModalSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/api/applications', {
        subdivision: formData.subdivision,
        description: formData.description,
        contactInfo: formData.contactInfo,
      });

      if (response.data.success) {
        setModalMessage(`Заявка успешно отправлена! ID: ${response.data.data.id}`);
        setModalSuccess(true);
      } else {
        setModalMessage(response.data.message || 'Ошибка при отправке заявки.');
        setModalSuccess(false);
      }
    } catch (error) {
      setModalMessage('Ошибка при отправке заявки. Проверьте сервер.');
      setModalSuccess(false);
    }

    setIsClosing(false);
    setModalVisible(true);
    setTimeout(() => setIsClosing(true), 5000);
    setFormData({ subdivision: '', description: '', contactInfo: '' });
  };

  const handleAnimationEnd = () => {
    if (isClosing) {
      setModalVisible(false);
      setIsClosing(false);
    }
  };

  return (
    <div className="form-application-form">
      <div className="form-header">
        <h1>Создание новой заявки</h1>
        <p>Заполните форму для подачи заявки на подбор саженцев</p>
      </div>
      <div className="form-card">
        <div className="form-card-content">
          <div className="form-card-icon" style={{ backgroundColor: '#4CAF50' }}>
            <span>📝</span>
          </div>
          <div className="form-card-text">
            <form onSubmit={handleSubmit}>
              <div className="form-form-group">
                <label htmlFor="subdivision">Подразделение/место</label>
                <input
                  type="text"
                  id="subdivision"
                  name="subdivision"
                  value={formData.subdivision}
                  onChange={handleChange}
                  placeholder="Введите подразделение или место"
                  required
                />
              </div>
              <div className="form-form-group">
                <label htmlFor="description">Описание</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Опишите ваши требования"
                  required
                />
              </div>
              <div className="form-form-group">
                <label htmlFor="contactInfo">Контактная информация</label>
                <input
                  type="text"
                  id="contactInfo"
                  name="contactInfo"
                  value={formData.contactInfo}
                  onChange={handleChange}
                  placeholder="Введите email или телефон"
                  required
                />
              </div>
              <button type="submit" className="form-card-button">
                Отправить <span className="form-arrow">→</span>
              </button>
            </form>
            <Link to="/application-list" className="form-back-link">
              ← Назад к списку
            </Link>
          </div>
        </div>
      </div>

      <div
        className={`form-modal-overlay ${modalVisible ? 'active' : ''} ${isClosing ? 'closing' : ''}`}
        onAnimationEnd={handleAnimationEnd}
      >
        <div className="form-modal-content">
          <div className="form-modal-icon" style={{ backgroundColor: modalSuccess ? '#4CAF50' : '#F44336' }}>
            <span>{modalSuccess ? '✔' : '✖'}</span>
          </div>
          <div className="form-modal-text">
            <h2>{modalSuccess ? 'Успех' : 'Ошибка'}</h2>
            <p>{modalMessage}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm;