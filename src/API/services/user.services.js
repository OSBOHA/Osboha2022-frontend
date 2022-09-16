import { api } from "../Intercepter"

class UserService {
  async getUnactive() {
    const users = await api.get(`users/list/un-active`);
    return users;

  }

  async getUnactiveReviwers() {
    const users = await api.get(`users/list/un-active-reviwers-auditors`);
    return users;

  }
  async deleteUser(id) {
    const user = await api.delete(`users/${id}`);
    return user;

  }
  async acceptUser(id) {
    const user = await api.patch(`users/activate/${id}`);
    return user;

  }

  acceptThesis(id) {
    return true;

  }
}

export default new UserService()

