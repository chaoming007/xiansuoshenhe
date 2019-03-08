import Cookies from 'js-cookie'

const LoginKey = 'hasLogin'
const Token="token";
export function getToken() {
  return Cookies.get(Token);
}

export function setToken(token) {
  Cookies.set(Token,token);
  return Cookies.set(LoginKey, "1")
}

export function removeToken() {
  Cookies.remove(Token);
  return Cookies.remove(LoginKey)
}
