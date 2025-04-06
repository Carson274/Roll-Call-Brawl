import React from 'react';
import { useParams } from 'react-router-dom';
import './ClassPage.css';

function ClassPage() {
  const { classId } = useParams<{ classId: string }>();

  return (
    <div className="classpage">
      <h1>Class: {classId?.toUpperCase()}</h1>
      <h2>Welcome to the {classId?.toUpperCase()} class page!</h2>
      <h3>Competitors</h3>
      <ul>
        <li>Carpettt</li>
        <li>Mitokongdrya</li>
        <li>Mokka</li>
        <li>Chat</li>
      </ul>
      <h3>Add Competitor</h3>
    </div>
  );
}

export default ClassPage;

