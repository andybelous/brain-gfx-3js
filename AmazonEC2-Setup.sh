#!/bin/bash
UNAMEX="ec2-user"
sudo yum update -y
sudo yum install docker -y
sudo yum install git -y
sudo service docker start
sudo usermod -a -G docker $UNAMEX
cd /home/$UNAMEX

# clone specific branch
git clone -b tbi-dev-rk https://github.com/PSUCompBio/brain-gfx-3js.git

# clone master branch
#git clone https://github.com/PSUCompBio/brain-gfx-3js.git
cd brain-gfx-3js
sudo docker build -t clincialimg .
cd /home/$UNAMEX
sudo chown -R $UNAMEX *
