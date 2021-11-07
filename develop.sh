#!/bin/bash
project_path="/var/lib/jenkins/workspace/seiii_front"
project_name="dist"
tomcat_home="/usr/local/apache-tomcat-8.5.63"
echo this is app : $project_name
echo tomcat : $tomcat_home
echo "删除dist"
rm  -rf $tomcat_home/webapps/ROOT

echo "复制dist"
mkdir $tomcat_home/webapps/ROOT
mv $project_path/$project_name/* $tomcat_home/webapps/ROOT/

echo "kill tomcat $tomcat_home"
ID=`ps -ef | grep java | grep $tomcat_home|awk '{print $2}'`
for id in $ID
do
    kill -9 $id
    echo "killed pid=$id"
done
echo "执行tomcat启动shell"
#防止jenkins构建完成后杀死tomcat进程
export BUILD_ID=dontKillMe
sh $tomcat_home/bin/startup.sh
#tail -f $tomcat_home/logs/catalina.out
exit 0