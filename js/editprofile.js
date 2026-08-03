function populateEditProfileForm() {
  clearEditProfileMessage();
  if (!currentUser) {
    return;
  }

  const usernameInput = document.getElementById("username");
  const telephoneInput = document.getElementById("telephone");
  const birthdateInput = document.getElementById("birthdate");
  const emailInput = document.getElementById("email");
  const currentPasswordInput = document.getElementById("curr-password");
  const newPasswordInput = document.getElementById("new-password");
  const confirmPasswordInput = document.getElementById("confirm-password");

  if (usernameInput) {
    usernameInput.value = currentUser.nome || "";
  }
  if (telephoneInput) {
    telephoneInput.value = currentUser.telefone || "";
  }
  if (birthdateInput) {
    birthdateInput.value = currentUser.data_nascimento || "";
  }
  if (emailInput) {
    emailInput.value = currentUser.email || "";
  }
  if (currentPasswordInput) {
    currentPasswordInput.value = "";
  }
  if (newPasswordInput) {
    newPasswordInput.value = "";
  }
  if (confirmPasswordInput) {
    confirmPasswordInput.value = "";
  }
}

function showEditProfileMessage(message, type = "error") {
  const messageElement = document.getElementById("edit-profile-message");
  if (!messageElement) return;

  messageElement.textContent = message;
  messageElement.classList.remove("text-success", "text-danger", "visually-hidden");
  messageElement.classList.add(type === "success" ? "text-success" : "text-danger");
}

function clearEditProfileMessage() {
  const messageElement = document.getElementById("edit-profile-message");
  if (!messageElement) return;

  messageElement.textContent = "";
  messageElement.classList.add("visually-hidden");
}

async function saveProfileEdit(event) {
  if (event) {
    event.preventDefault();
  }

  clearEditProfileMessage();

  const usernameInput = document.getElementById("username");
  const telephoneInput = document.getElementById("telephone");
  const birthdateInput = document.getElementById("birthdate");
  const emailInput = document.getElementById("email");
  const currentPasswordInput = document.getElementById("curr-password");
  const newPasswordInput = document.getElementById("new-password");
  const confirmPasswordInput = document.getElementById("confirm-password");

  if (!usernameInput || !telephoneInput || !birthdateInput || !emailInput || !currentPasswordInput || !newPasswordInput || !confirmPasswordInput) {
    showEditProfileMessage("Ocorreu um erro no formulário de edição.");
    return false;
  }

  if (!currentUser) {
    showEditProfileMessage("Nenhum usuário autenticado.");
    return false;
  }

  const originalEmail = currentUser.email;
  const nameValue = usernameInput.value.trim();
  const telephoneValue = telephoneInput.value.trim();
  const birthdateValue = birthdateInput.value;
  const emailValue = emailInput.value.trim();
  const currentPasswordValue = currentPasswordInput.value.trim();
  const newPasswordValue = newPasswordInput.value.trim();
  const confirmPasswordValue = confirmPasswordInput.value.trim();

  if (!nameValue) {
    showEditProfileMessage("O nome não pode ficar em branco.");
    return false;
  }

  if (!emailValue || !isValidEmail(emailValue)) {
    showEditProfileMessage("Informe um e-mail válido.");
    return false;
  }

  if (!telephoneValue || telephoneValue && !isValidPhone(telephoneValue)) {
    showEditProfileMessage("Informe um telefone válido.");
    return false;
  }

  if (!birthdateValue) {
    showEditProfileMessage("Informe sua data de nascimento.");
    return false;
  }

  const updatedUser = {
    ...currentUser,
    nome: nameValue,
    email: emailValue,
    telefone: telephoneValue,
    data_nascimento: birthdateValue
  };

  if (newPasswordValue || confirmPasswordValue || currentPasswordValue) {
    if (!currentPasswordValue) {
      showEditProfileMessage("Informe sua senha atual para alterar a senha.");
      return false;
    }

    if (newPasswordValue.length < 6) {
      showEditProfileMessage("A nova senha deve ter no mínimo 6 caracteres.");
      return false;
    }

    if (newPasswordValue !== confirmPasswordValue) {
      showEditProfileMessage("A nova senha e a confirmação não coincidem.");
      return false;
    }

    try {
      const validated = await authenticateUser(originalEmail, currentPasswordValue);
      if (!validated) {
        showEditProfileMessage("Senha atual incorreta.");
        return false;
      }
      updatedUser.senha = newPasswordValue;
    } catch (error) {
      console.error("Erro ao validar senha atual", error);
      showEditProfileMessage("Erro ao validar a senha atual.");
      return false;
    }
  }

  const savedUser = await updateMockUser(originalEmail, updatedUser);
  if (!savedUser) {
    showEditProfileMessage("Não foi possível atualizar o cadastro. Verifique se o e-mail ou nome já estão em uso.");
    return false;
  }

  saveUserToStorage(savedUser);
  showEditProfileMessage("Dados atualizados com sucesso.", "success");
  updateUserInterface();

  setTimeout(() => {
    navigate("/perfil");
  }, 800);

  return false;
}