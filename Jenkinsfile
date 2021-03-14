#!/usr/bin/env groovy
node {


    stage('git clone') { // for display purposes
        // Get some code from a GitHub repository
        git credentialsId: 'lxyeah', url: 'http://212.129.149.40/181250092_seiiimaskon/frontend-seiiiassignment.git'
        // Get the Maven tool.
        // ** NOTE: This 'M3' Maven tool must be configured
        // **       in the global configuration.

    }


    stage('Build') {

            echo 'buid start'

            sh 'npm install && npm run build'


    }




}