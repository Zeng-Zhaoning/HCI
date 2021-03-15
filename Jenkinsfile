#!/usr/bin/env groovy
node {
    def nodeHome
    nodeHome = tool 'node'
    env.PATH = "${nodeHome}/bin;${env.PATH}"

    stage('git clone') { // for display purposes
        // Get some code from a GitHub repository
        git credentialsId: 'lxyeah', url: 'http://212.129.149.40/181250092_seiiimaskon/frontend-seiiiassignment.git'
        // Get the Maven tool.
        // ** NOTE: This 'M3' Maven tool must be configured
        // **       in the global configuration.

    }

    stage('Npm Install') {
        echo 'install start'

        sh 'npm install'
    }

    stage('Build') {

        echo 'buid start'

        sh 'JENKINS_NODE_COOKIE=dontKillMe sh ./run.sh'


    }

    stage('Deploy') {

        echo 'deploy'

        sh 'npm run serve'

    }




}