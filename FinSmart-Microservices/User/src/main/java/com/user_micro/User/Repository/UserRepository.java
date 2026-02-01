package com.user_micro.User.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.user_micro.User.Model.User;



public interface UserRepository extends JpaRepository<User, Long> {
	User findByEmail(String email);
	User findByUsername(String username);
	boolean existsByUsername(String username);
	boolean existsByEmail(String email);

}