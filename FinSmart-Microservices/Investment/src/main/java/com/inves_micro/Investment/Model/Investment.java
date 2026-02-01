package com.inves_micro.Investment.Model;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "investments")
public class Investment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Goal for Investment cannot be Null")
    @Column(name = "goal_name", nullable = false, length = 100)
    private String goalName;

    @NotNull(message = "The target amount should be given")
    @Min(value = 500, message = "At least your minimum investment goal should be 500")
    @Column(name = "target_amount", nullable = false)
    private Double targetAmount;

    @NotNull(message = "Starting date of your Investment is required")
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @NotNull(message = "End date of your Investment is required")
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(length = 50)
    private String status = "In-Progress";

   
    @Column(name = "user_id")
    private Long userId;


	public Investment(Long id, @NotBlank(message = "Goal for Investment cannot be Null") String goalName,
			@NotNull(message = "The target amount should be given") @Min(value = 500, message = "At least your minimum investment goal should be 500") Double targetAmount,
			@NotNull(message = "Starting date of your Investment is required") LocalDate startDate,
			@NotNull(message = "End date of your Investment is required") LocalDate endDate, String status,
			Long userId) {
		super();
		this.id = id;
		this.goalName = goalName;
		this.targetAmount = targetAmount;
		this.startDate = startDate;
		this.endDate = endDate;
		this.status = status;
		this.userId = userId;
	}


	public Investment() {
		super();
		// TODO Auto-generated constructor stub
	}


	public Long getId() {
		return id;
	}


	public void setId(Long id) {
		this.id = id;
	}


	public String getGoalName() {
		return goalName;
	}


	public void setGoalName(String goalName) {
		this.goalName = goalName;
	}


	public Double getTargetAmount() {
		return targetAmount;
	}


	public void setTargetAmount(Double targetAmount) {
		this.targetAmount = targetAmount;
	}


	public LocalDate getStartDate() {
		return startDate;
	}


	public void setStartDate(LocalDate startDate) {
		this.startDate = startDate;
	}


	public LocalDate getEndDate() {
		return endDate;
	}


	public void setEndDate(LocalDate endDate) {
		this.endDate = endDate;
	}


	public String getStatus() {
		return status;
	}


	public void setStatus(String status) {
		this.status = status;
	}


	public Long getUserId() {
		return userId;
	}


	public void setUserId(Long userId) {
		this.userId = userId;
	}


	@Override
	public String toString() {
		return "Investment [id=" + id + ", goalName=" + goalName + ", targetAmount=" + targetAmount + ", startDate="
				+ startDate + ", endDate=" + endDate + ", status=" + status + ", userId=" + userId + "]";
	}
    
    
}
