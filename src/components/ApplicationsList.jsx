import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/ApplicationList.css'; // Создадим этот файл позже

const ApplicationList = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/applications');
        if (response.data.success) {
          setApplications(response.data.data);
        } else {
          setError('Не удалось загрузить заявки.');
        }
      } catch (err) {
        setError('Ошибка при загрузке заявок. Проверьте сервер.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="application-form-application-list">
      <div className="application-form-header">
        <h1>Список всех заявок</h1>
        <p>Здесь отображаются все поданные заявки</p>
      </div>
      <div className="application-form-card">
        {applications.length === 0 ? (
          <p>Нет заявок.</p>
        ) : (
          <table className="application-form-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Подразделение/место</th>
                <th>Описание</th>
                <th>Контактная информация</th>
                <th>Статус</th>
                <th>Время создания</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id}>
                  <td>{app.id}</td>
                  <td>{app.subdivision}</td>
                  <td>{app.description}</td>
                  <td>{app.contact_info}</td>
                  <td>{app.status}</td>
                  <td>{new Date(app.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Link to="/application-form" className="application-form-back-link">
          ← Создать новую заявку
        </Link>
      </div>
    </div>
  );
};

export default ApplicationList;