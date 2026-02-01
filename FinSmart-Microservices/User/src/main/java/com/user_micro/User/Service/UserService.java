package com.user_micro.User.Service;

import java.util.List;
import java.util.Optional;

import com.user_micro.User.Model.User;

public interface UserService  {
    User createUser(User u);
	Optional<User> getUserById(Long id);
	List<User> getAllUser();
	User getUserByUsername(String username);
	User getUserByEmail(String email);
	void sendPasswordResetCode(String email);
	void resetPassword(String email, String resetCode, String newPassword);
}
