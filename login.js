import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: username,
      password: password,
    });

    if (error) throw error;

    if (data.user) {
      localStorage.setItem("isLoggedIn", "true");
      window.location.href = "admin.html";
    }
  } catch (error) {
    alert("Error de autenticación: " + error.message);
  }
});
