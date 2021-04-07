# brain-gfx-3js

# AWS Install on ElasticBeanStalk

Locally from within directory you want to zip up imporant files.
Be sure to change the 19 to the latest number

'> zip -r clinicalimgv1-source-19.zip .npmrc server.js package.json config'

Then upload the zip file to elasticbeanstalk.

# Local Install

## To install

npm install

## To test

node test.js
Should create a example.png

# Instruction on Local Lambda use.
- ? 

### from ec2 instance used to build docker image
- After the inital start up, you might want to check the startup logs to check for errors: vi /var/log/cloud-init-output.log
- The AWS access and secret keys need to be manually placed in the config/configuration_keys.json file
- Rebuild the docker image w/ config keys: sudo docker build -t clincialimg .
- Login to aws: aws configure
- Login to ecr: sudo $(aws ecr get-login --region us-east-1 --no-include-email)
- Get docker image ID: sudo docker image ls
- Tag docker image: sudo docker tag <ImageID> <AwsAccountID>.dkr.ecr.us-east-1.amazonaws.com/clinicalimg
-- Note: you can go to AWS ECR repos to get URL above.
- Push docker to ecr: sudo docker push <AWS-Account-ID>.dkr.ecr.us-east-1.amazonaws.com/
- Update lambda function with latest docker image (this has to be done manually)