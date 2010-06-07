<?php

/**
 * @author CRP Henri Tudor - TAO Team - {@link http://www.tao.lu}
 * @license GPLv2  http://www.opensource.org/licenses/gpl-2.0.php
 */


if (isset($_SERVER['CONFIG_PATH'])) {
	define('CONFIG_PATH',$_SERVER['CONFIG_PATH']);
} else {
	define('CONFIG_PATH',dirname(__FILE__).'/../../generis/common');
}
define('DEBUG_MODE_ENABLED', true);
//require_once CONFIG_PATH.'/config.php.in';
$include_path = CONFIG_PATH.'/../includes';

require_once $include_path.'/adodb/adodb-exceptions.inc.php';
require_once $include_path.'/adodb/adodb.inc.php';
require_once 'utils.php'; 

if (empty($_POST))
{
	include_once 'index.php';
}
else {

	$param = $_POST["param"];
	install($param);

}


function install($param){
	$message = '';
	if(!isset($param['dbhost']) || $param['dbhost'] == ''){
		$message .= urlencode("The field <b>Database Hostname</b> is mandatory.")."<br/>";
		header('Location:http://'.$_SERVER['HTTP_HOST'].$_SERVER['PHP_SELF'].'?message='.$message);
		exit(0);
	}
	if(!isset($param['dbuser']) || $param['dbuser'] == ''){
		$message .= urlencode("The field <b>Database User</b> is mandatory.")."<br/>";
		header('Location:http://'.$_SERVER['HTTP_HOST'].$_SERVER['PHP_SELF'].'?message='.$message);
		exit(0);
	}
	if(!isset($param['dbpass']) /*|| $param['dbpass'] == ''*/){
		$message .= urlencode("The field <b>Database Password</b> is mandatory.")."<br/>";
		header('Location:http://'.$_SERVER['HTTP_HOST'].$_SERVER['PHP_SELF'].'?message='.$message);
		exit(0);
	}
	if(!isset($param['moduleName']) || $param['moduleName'] == ''){
		$message .= urlencode("The field <b>Module Name</b> is mandatory.")."<br/>";
		header('Location:http://'.$_SERVER['HTTP_HOST'].$_SERVER['PHP_SELF'].'?message='.$message);
		exit(0);
	}
	if(!isset($param['login']) || $param['login'] == ''){
		$message .= urlencode("The field <b>Super User Login</b> is mandatory.")."<br/>";
		header('Location:http://'.$_SERVER['HTTP_HOST'].$_SERVER['PHP_SELF'].'?message='.$message);
		exit(0);
	}
	if(!isset($param['pass']) || $param['pass'] == ''){
		$message .= urlencode("The field <b>Super User Password</b> is mandatory.")."<br/>";
		header('Location:http://'.$_SERVER['HTTP_HOST'].$_SERVER['PHP_SELF'].'?message='.$message);
		exit(0);
	}
	if(!isset($param['passc']) || $param['passc'] == ''){
		$message .= urlencode("The field <b>Super User Confirm Password</b> is mandatory.")."<br/>";
		header('Location:http://'.$_SERVER['HTTP_HOST'].$_SERVER['PHP_SELF'].'?message='.$message);
		exit(0);
	}
	if($param['passc'] != $param['pass']){
		$message .= urlencode("<b>Password</b> do not match")."<br/>";
		header('Location:http://'.$_SERVER['HTTP_HOST'].$_SERVER['PHP_SELF'].'?message='.$message);
		exit(0);
	}



	// Does config.php.in exist?
	$config_in = CONFIG_PATH.'/config.php.in';
	if (!is_file($config_in)) {
		throw new Exception(sprintf('File %s does not exist.',$config_in));
	}
	try {
		$con = &NewADOConnection($param["dbdriver"]);
//		$con->debug = true;
		$con->Connect($param["dbhost"], $param["dbuser"], $param["dbpass"]);
		$con->Execute('DROP DATABASE IF EXISTS '. $param["moduleName"]. ' ;');
		$con->Execute('CREATE DATABASE '.  $param["moduleName"] . ' ;');
		$con->Execute('USE '. $param["moduleName"] . ';');

		loadSql('db/tao-trsfr.sql',$con);
		echo "DataBase created : <b>". $param["moduleName"] . "</b><br/>";

		$nameSpace="http://".$_SERVER['HTTP_HOST']."/middleware/".$param["moduleName"].".rdf";
		$lastName = $param['lastName'];
		$firstName = $param['firstName'];
		$email = $param["email"];
		$company = $param["company"];
		$login = $param["login"];
		$pass = md5($param['pass']);
		$lg = $param["lg"];
		
		$sql = "INSERT INTO `settings` (`key`, `value`) VALUES ('NameSpace', '$nameSpace');";
		$con->Execute($sql) or die("NameSpace configuration error");
		echo 'Namespace configured : <b>'. $nameSpace .'</b><br/>';
		
		$sql = "INSERT INTO `settings` (`key`, `value`) VALUES ('Deflg', '$lg');";
		$con->Execute($sql) or die("Deflg configuration error");
		echo 'Default Language configured : <b>'. $lg .'</b><br/>';
		
		$sql = "INSERT INTO `settings` (`key`, `value`) VALUES ('Timeout', '99');";
		$con->Execute($sql) or die("Timeout configuration error");
		echo 'Timeout  configured : <b>99 </b><br/>';
		
		$sql = "INSERT INTO `settings` (`key`, `value`) VALUES ('Moduletype', 'resource');";
		$con->Execute($sql) or die("Moduletype configuration error");
		echo 'Moduletype  configured : <b>resource</b><br/>';


//		$query = "	INSERT INTO `user` ( `login` , `password` , `admin` , `usergroup` , `LastName` , `FirstName` , 
//				`E_Mail` , `Company` , `Deflg` , `enabled` ) VALUES ('$login', '$pass', '1', 'admin', '$lastName', 
//				'$firstName', '$email', '$company', '$lg', '1')";
//		$con->Execute($query) or die("User configuration error");
//		echo "User created : <b>" . $login ."</b><br/>";

		$con->Execute("INSERT INTO `models` VALUES ('8', '".$nameSpace."', '".$nameSpace."#')");

		
		loadSqlReplaceNS('db/sampleData.sql',$con,$nameSpace);
		
		$fileContent = file_get_contents('db/qcmContent.sql');
		$fileContent = str_replace("##NAMESPACE",$nameSpace,$fileContent);
		$con->Execute($fileContent); 
		$con->Close();

	} catch (exception $e) {
		$message .= urlencode("<b>Problem found </b> : <br/>". substr($e->getMessage(),0 ,200) . "<br/>");
		header('Location:http://'.$_SERVER['HTTP_HOST'].$_SERVER['PHP_SELF'].
							'?message='.$message . 
							'&dbhost='.urlencode($param["dbhost"]) .
							'&dbname='. urlencode($param["moduleName"]) .
							'&dbuser='. urlencode($param["dbuser"]) . 
							'&dbpass='. urlencode($param["dbpass"]) .
							'&dbdriver='. urlencode($param["dbdriver"]) .
							'&pass='. urlencode($param["pass"]).
							'&login='. urlencode($param["login"]).
							'&passc='. urlencode($param["passc"]).
							'&company='. urlencode($param["company"]).
							'&moduleName='. urlencode($param["moduleName"]).
							'&lastName='. urlencode($param["lastName"]).
							'&firstName='. urlencode($param["firstName"]).
							'&lg='. urlencode($param["lg"]).
							'&email='. urlencode($param["email"])

		);
		exit;
		var_dump($e);
		adodb_backtrace($e->gettrace());
	}


	$config = file_get_contents($config_in);


	writeConfigValue('DATABASE_LOGIN', $param["dbuser"],$config);
	writeConfigValue('DATABASE_PASS', $param["dbpass"],$config);
	writeConfigValue('DATABASE_URL', $param["dbhost"],$config);
	writeConfigValue('SGBD_DRIVER', $param["dbdriver"],$config);
	writeConfigValue('DATABASE_NAME', $param["moduleName"],$config);


	//TODO
	$filename = CONFIG_PATH.'/config.php';
	$fp = @fopen($filename,'wb');
	if ($fp === false) {
		throw new Exception(sprintf('Cannot write %s file.',$filename));
	}
	fwrite($fp,$config);
	fclose($fp);

	echo 'File ' . $filename .' written <br/>';
	

	$extensions = array('tao', 'taoDelivery' , 'taoGroups', 'taoItems' , 'taoResults', 'taoSubjects' , 'taoTests', 'filemanager' , 'wfEngine' );
	$extensions_path = CONFIG_PATH.'/../..';
	foreach ($extensions as $ext) {
		$config = file_get_contents( $extensions_path. '/'. $ext.'/includes/config.php.sample');
		$filename = $extensions_path. '/'. $ext.'/includes/config.php';
		$fp = @fopen($filename,'wb');
		if ($fp === false) {
			throw new Exception(sprintf('Cannot write %s file.',$filename));
		}
		fwrite($fp,$config);
		fclose($fp);
	
		echo 'File ' . $filename .' written <br/>';
		echo 'Extension : <b>' . $ext. '</b> instaled<br/>';
	}
	
		require_once CONFIG_PATH.'/inc.extension.php';	

	define('INSTALL_DATABASE_NAME' , $param["moduleName"]);
	include_once 'update/1.1/01_database.php';
	

		

	core_control_FrontController::connect(SYS_USER_LOGIN, SYS_USER_PASS, DATABASE_NAME);

	
	$generisUserClass = new core_kernel_classes_Class(CLASS_GENERIS_USER);

	$classRole = new core_kernel_classes_Class(CLASS_ROLE);
	$classTaoManager = new core_kernel_classes_Class('http://www.tao.lu/Ontologies/TAO.rdf#TaoManagerRole');
	
	
	$loginProp = new core_kernel_classes_Property(PROPERTY_USER_LOGIN);
	$passProp = new core_kernel_classes_Property(PROPERTY_USER_PASSWORD);
	$defLgProp = new core_kernel_classes_Property(PROPERTY_USER_DEFLG);
	$firstNameProp = new core_kernel_classes_Property(PROPERTY_USER_FIRTNAME);
	$mailProp = new core_kernel_classes_Property(PROPERTY_USER_MAIL);
	$lastNameProp = new core_kernel_classes_Property(PROPERTY_USER_LASTNAME);
	$uiLgProp = new core_kernel_classes_Property(PROPERTY_USER_UILG);
	
	
//	$dbWarpper = core_kernel_classes_DbWrapper::singleton(DATABASE_NAME);
//	$dbWarpper->dbConnector->debug = true;	
	$newUserInstance = $classTaoManager->createInstance('User_'.$login,'Generated during update from user table on'. date(DATE_ISO8601));
//	$dbWarpper->dbConnector->debug = false;	
	$newUserInstance->setPropertyValue($loginProp,$login);
	$newUserInstance->setPropertyValue($passProp,$pass);
	$newUserInstance->setPropertyValue($lastNameProp,$lastName);
	$newUserInstance->setPropertyValue($firstNameProp,$firstName);
	$newUserInstance->setPropertyValue($mailProp,$email);
	$newUserInstance->setPropertyValue($defLgProp,'http://www.tao.lu/Ontologies/TAO.rdf#Lang'.strtoupper($lg));
	$newUserInstance->setPropertyValue($uiLgProp, 'http://www.tao.lu/Ontologies/TAO.rdf#Lang'.strtoupper($lg));

	if(!defined('DEBUG_MODE_ENABLED') || !DEBUG_MODE_ENABLED){
		$installator = new core_kernel_classes_Resource('http://www.tao.lu/Ontologies/TAO.rdf#installator');
		$installator->delete();
			 
	}
	else{
		echo "<b>DEBUG MODE ENABLED  SYS_USER created <br/>"; 
	}
	echo "User created : <b>" . $login ."</b><br/>";
	
	$location='http://'.$_SERVER['HTTP_HOST']."/taoResults/models/ext/utrv1/classes/class.ResultModelBuilder.php";//?resultxml=".urlencode($xmlPath);
    //send with curl
    $url = $location;

    $ch = curl_init();
    //set options
    curl_setopt($ch,CURLOPT_URL,$url);

    curl_setopt($ch,CURLOPT_POST,1);
    //curl_setopt($ch,CURLOPT_POSTFIELDS,$postFieldes);
    curl_setopt($ch, CURLOPT_FAILONERROR, 1);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);// allow redirect
    curl_setopt($ch, CURLOPT_RETURNTRANSFER,1); // return into a variable
    curl_setopt($ch, CURLOPT_TIMEOUT, 60); // 
    //close the cURL connexion

    $result = curl_exec($ch);
	echo '<hr/><b>Installation Complete</b><br/>';
	echo "<br/><center><a href='/tao'>Go to TAO</a></center>";
}

?>
