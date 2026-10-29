import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import bgImage from '../../assets/Imagem_Login.jpg'; 

import { FormField } from '../../shared/components/FormField';
import { authService } from '../../shared/services/authService';

export default function RegisterFormComponent(props) {
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    cep: "",
    numero: "",
    foto: null
  });
  const [fotoPreview, setFotoPreview] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    window.location = "http://localhost:8080";  // BACK URL
  },[])

  return(
    <div>

    </div>
  )
}