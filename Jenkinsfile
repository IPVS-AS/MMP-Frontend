#!groovy

def version = "${env.BUILD_NUMBER}"

properties(
    [
        [$class: 'BuildDiscarderProperty', strategy:
        [$class: 'LogRotator', artifactDaysToKeepStr: '14', artifactNumToKeepStr: '5', daysToKeepStr: '30', numToKeepStr: '60']],

    ]
)

node {
    //sh 'apk add --no-cache nodejs && npm install -g @angular/cli'

    stage('Checkout') {
        cleanWs()
        checkout scm
    }

    stage('NPM Install') {
        withEnv(["NPM_CONFIG_LOGLEVEL=warn"]) {
            sh 'npm install'
        }
    }

//    stage('Test') {
//        withEnv(["CHROME_BIN=/usr/bin/chromium-browser"]) {
//          sh 'ng test --progress=false --watch=false'
//        }
//        //junit '**/test-results.xml'
//    }

    stage('Lint') {
        sh 'ng lint'
    }

    stage('Build') {
        milestone()
        sh 'ng build --prod --aot --source-map --progress=false'
    }


	stage('Publish Docker') {
		docker.withServer('tcp://10.0.19.19:2375') {
			docker.withRegistry('https://10.0.19.19:18444', 'adminnexus') {
				docker.build("ipvs.as/mmp-frontend", ".").push("${version}")
			}
		}
	}


	def containerName = "mmp-frontend${version}"
	def deployedWorked = false

	stage('Test Docker') {
		docker.withServer('tcp://10.0.19.19:2375') {
		  sh """docker run -d --name ${containerName} \
		  -p 8080:80 10.0.19.19:18444/ipvs.as/mmp-frontend:${version}"""
		}

		try {
			deployedWorked = postDeployCheck(containerName)
		} finally {

			docker.withServer('tcp://10.0.19.19:2375') {
				sh "docker rm -f ${containerName}"
				sh "docker rmi -f 10.0.19.19:18444/ipvs.as/mmp-frontend:${version}"
				sh "docker rmi -f ipvs.as/mmp-frontend:latest"
			}

		}
	}

	stage('Archive') {
        sh 'tar -cvzf dist.tar.gz --strip-components=1 dist'
        archiveArtifacts artifacts: 'dist.tar.gz'
    }

    stage('Deploy Frontend') {

		if (deployedWorked) {
			docker.withServer('tcp://10.0.19.183:2375') {
				docker.withRegistry('https://10.0.19.19:18444', 'adminnexus') {
					sh "docker stop mmp-frontend || true && docker rm mmp-frontend || true"
					sh "docker rmi \$(docker images |grep '10.0.19.19:18444/ipvs.as/mmp-frontend') || true"
					sh "docker pull 10.0.19.19:18444/ipvs.as/mmp-frontend:${version}"
					sh "docker run -d --name=mmp-frontend --restart=always -p 80:80 10.0.19.19:18444/ipvs.as/mmp-frontend:${version}"

			}
		  }
    }
    }
}

def postDeployCheck(containerName) {
    sleep 10

    script{
	    try {
	        def statusCode = sh(script: "curl --max-time 30 -sL -w '%{http_code}' '10.0.19.19:8080' -o /dev/null", returnStdout: true).trim()

          if (statusCode == '200') {
            currentBuild.result = 'SUCCESS'
            return true
          }
          currentBuild.result = 'FAILURE'
          return false
        } catch(error) {
          sleep 1
          currentBuild.result = 'FAILURE'
          return false

     }
    }

}
