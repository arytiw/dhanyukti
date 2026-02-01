# ==========================================
# STAGE 1: THE BUILDER
# ==========================================
FROM maven:3.9.6-eclipse-temurin-21 AS builder

RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

WORKDIR /app

# Copy only pom.xml files first to cache Maven dependencies
# This layer will be cached unless pom.xml files change
COPY ./FinSmart-Microservices/Eureka/pom.xml ./FinSmart-Microservices/Eureka/
COPY ./FinSmart-Microservices/User/pom.xml ./FinSmart-Microservices/User/
COPY ./FinSmart-Microservices/Expenses/pom.xml ./FinSmart-Microservices/Expenses/
COPY ./FinSmart-Microservices/Investment/pom.xml ./FinSmart-Microservices/Investment/
COPY ./FinSmart-Microservices/Tax/pom.xml ./FinSmart-Microservices/Tax/
COPY ./FinSmart-Microservices/Razorpay/pom.xml ./FinSmart-Microservices/Razorpay/
COPY ./FinSmart-Microservices/Stonks/pom.xml ./FinSmart-Microservices/Stonks/
COPY ./FinSmart-Microservices/Support/pom.xml ./FinSmart-Microservices/Support/

# Download Maven dependencies (this layer will be cached)
# Using dependency:go-offline to download all dependencies without building
RUN cd /app/FinSmart-Microservices/Eureka && mvn dependency:go-offline -B || true
RUN cd /app/FinSmart-Microservices/User && mvn dependency:go-offline -B || true
RUN cd /app/FinSmart-Microservices/Expenses && mvn dependency:go-offline -B || true
RUN cd /app/FinSmart-Microservices/Investment && mvn dependency:go-offline -B || true
RUN cd /app/FinSmart-Microservices/Tax && mvn dependency:go-offline -B || true
RUN cd /app/FinSmart-Microservices/Razorpay && mvn dependency:go-offline -B || true
RUN cd /app/FinSmart-Microservices/Stonks && mvn dependency:go-offline -B || true
RUN cd /app/FinSmart-Microservices/Support && mvn dependency:go-offline -B || true

# Copy npm dependency files first for frontend caching
COPY ./dhanayukti-spark-main/package.json ./dhanayukti-spark-main/package-lock.json ./dhanayukti-spark-main/

# Install npm dependencies (this layer will be cached unless package files change)
RUN cd /app/dhanayukti-spark-main && npm ci --prefer-offline --no-audit

# Now copy all source code (this layer invalidates when source changes)
COPY ./FinSmart-Microservices/ ./FinSmart-Microservices/
COPY ./dhanayukti-spark-main/ ./dhanayukti-spark-main/

# Build all microservices (dependencies are already cached)
RUN cd /app/FinSmart-Microservices/Eureka && mvn clean package -DskipTests -B
RUN cd /app/FinSmart-Microservices/User && mvn clean package -DskipTests -B
RUN cd /app/FinSmart-Microservices/Expenses && mvn clean package -DskipTests -B
RUN cd /app/FinSmart-Microservices/Investment && mvn clean package -DskipTests -B
RUN cd /app/FinSmart-Microservices/Tax && mvn clean package -DskipTests -B
RUN cd /app/FinSmart-Microservices/Razorpay && mvn clean package -DskipTests -B
RUN cd /app/FinSmart-Microservices/Stonks && mvn clean package -DskipTests -B
RUN cd /app/FinSmart-Microservices/Support && mvn clean package -DskipTests -B

# Build frontend (dependencies are already installed)
# Use empty strings for API URLs to use relative URLs (proxied by nginx)
ARG VITE_RAZORPAY_KEY_ID=rzp_test_Rrz09ERfzDOoli
RUN cd /app/dhanayukti-spark-main && \
    VITE_USER_API="" \
    VITE_EXPENSE_API="" \
    VITE_INVESTMENT_API="" \
    VITE_TAX_API="" \
    VITE_RAZORPAY_API="" \
    VITE_STONKS_API="" \
    VITE_RAZORPAY_KEY_ID="$VITE_RAZORPAY_KEY_ID" \
    npm run build

# ==========================================
# STAGE 2: THE RUNTIME
# ==========================================
FROM eclipse-temurin:21-jdk-jammy

# Install dependencies
RUN apt-get update && apt-get install -y mysql-server nginx supervisor && rm -rf /var/lib/apt/lists/*

# Fix Supervisor Socket and Log directories
RUN mkdir -p /var/log/supervisor /var/run/supervisor && \
    chmod 777 /var/run/supervisor

# Configure MySQL (password can be set at runtime via --env-file)
# If not provided, init script and Spring apps fall back to Laksh#28
ENV MYSQL_ROOT_PASSWORD=
RUN usermod -d /var/lib/mysql/ mysql && \
    mkdir -p /var/lib/mysql /var/run/mysqld && \
    chown -R mysql:mysql /var/lib/mysql /var/run/mysqld && \
    chmod 777 /var/run/mysqld

# Initialize MySQL (insecure for first run, will be secured on startup)
RUN mysqld --initialize-insecure --user=mysql --datadir=/var/lib/mysql || true

# Create database initialization script that runs after MySQL starts
# Note: Uses $MYSQL_ROOT_PASSWORD environment variable at runtime
RUN echo '#!/bin/bash\n\
set -e\n\
PASSWORD="${MYSQL_ROOT_PASSWORD:-Laksh#28}"\n\
echo "Waiting for MySQL to be ready..."\n\
for i in {1..60}; do\n\
  if mysqladmin ping -h localhost --silent 2>/dev/null; then\n\
    echo "MySQL is ready!"\n\
    break\n\
  fi\n\
  if [ $i -eq 60 ]; then\n\
    echo "MySQL failed to start after 60 seconds"\n\
    exit 1\n\
  fi\n\
  echo "Waiting for MySQL... ($i/60)"\n\
  sleep 1\n\
done\n\
\n\
# Set root password\n\
mysql -e "ALTER USER '\''root'\''@'\''localhost'\'' IDENTIFIED WITH mysql_native_password BY '\''$PASSWORD'\'';" 2>/dev/null || mysql -e "SET PASSWORD FOR '\''root'\''@'\''localhost'\'' = PASSWORD('\''$PASSWORD'\'');" 2>/dev/null || true\n\
\n\
# Create databases\n\
mysql -p"$PASSWORD" -e "CREATE DATABASE IF NOT EXISTS \`expense-microservice\`;" 2>/dev/null || mysql -e "CREATE DATABASE IF NOT EXISTS \`expense-microservice\`;" 2>/dev/null || true\n\
mysql -p"$PASSWORD" -e "CREATE DATABASE IF NOT EXISTS \`user-microservice\`;" 2>/dev/null || mysql -e "CREATE DATABASE IF NOT EXISTS \`user-microservice\`;" 2>/dev/null || true\n\
mysql -p"$PASSWORD" -e "CREATE DATABASE IF NOT EXISTS \`investment-microservice\`;" 2>/dev/null || mysql -e "CREATE DATABASE IF NOT EXISTS \`investment-microservice\`;" 2>/dev/null || true\n\
mysql -p"$PASSWORD" -e "CREATE DATABASE IF NOT EXISTS \`tax-microservice\`;" 2>/dev/null || mysql -e "CREATE DATABASE IF NOT EXISTS \`tax-microservice\`;" 2>/dev/null || true\n\
mysql -p"$PASSWORD" -e "CREATE DATABASE IF NOT EXISTS \`wealth_db\`;" 2>/dev/null || mysql -e "CREATE DATABASE IF NOT EXISTS \`wealth_db\`;" 2>/dev/null || true\n\
echo "Databases initialized successfully"\n\
' > /init-databases.sh && chmod +x /init-databases.sh

WORKDIR /app

# Copy JARs
COPY --from=builder /app/FinSmart-Microservices/Eureka/target/*.jar /app/eureka.jar
COPY --from=builder /app/FinSmart-Microservices/User/target/*.jar /app/user.jar
COPY --from=builder /app/FinSmart-Microservices/Expenses/target/*.jar /app/expenses.jar
COPY --from=builder /app/FinSmart-Microservices/Investment/target/*.jar /app/investment.jar
COPY --from=builder /app/FinSmart-Microservices/Tax/target/*.jar /app/tax.jar
COPY --from=builder /app/FinSmart-Microservices/Razorpay/target/*.jar /app/razorpay.jar
COPY --from=builder /app/FinSmart-Microservices/Stonks/target/*.jar /app/stonks.jar
COPY --from=builder /app/FinSmart-Microservices/Support/target/*.jar /app/support.jar

# Frontend and Config
RUN mkdir -p /var/www/html
COPY --from=builder /app/dhanayukti-spark-main/dist /var/www/html
COPY 502.html /var/www/html/502.html
RUN if [ ! -f /var/www/html/index.html ]; then echo "<html><body><h1>Frontend not built</h1></body></html>" > /var/www/html/index.html; fi
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY nginx.conf /etc/nginx/sites-available/default
RUN rm -f /etc/nginx/sites-enabled/default && \
    ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

# Only expose nginx port 80 externally
# Backend services (8099, 8123, 8124, 8125, 8126, 8127, 9093) and Eureka (8761) 
# run internally and communicate with nginx via localhost
EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]