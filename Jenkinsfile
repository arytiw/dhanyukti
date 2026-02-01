pipeline {
    agent any

    environment {
        IMAGE_NAME = "arytiw/dhanyukti"
        IMAGE_TAG  = "jenkins"
        // Ensure this matches the ID in Jenkins -> Credentials
        DOCKER_HUB_CRED_ID = "dockerhubcreds" 
    }

    stages {
        stage('Checkout Code') {
            steps {
                // Using 'main' as requested earlier
                git branch: 'main', url: 'https://github.com/arytiw/dhanyukti.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    echo "Building: ${IMAGE_NAME}:${IMAGE_TAG}"
                    // Building and keeping a reference to the image object
                    sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ."
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    // Leaving the URL empty "" is the safest way to target Docker Hub
                    docker.withRegistry('', "${DOCKER_HUB_CRED_ID}") {
                        docker.image("${IMAGE_NAME}:${IMAGE_TAG}").push()
                    }
                }
            }
        }
    }

    post {
        success { echo "Success: ${IMAGE_NAME}:${IMAGE_TAG} is now on Docker Hub" }
        failure { 
            echo "Pipeline failed. Check if 'dockerhubcreds' matches your Jenkins Credential ID." 
        }
        always {
            // Clean up local images to save disk space on the Jenkins agent
            sh "docker rmi ${IMAGE_NAME}:${IMAGE_TAG} || true"
        }
    }
}