<?php
header('Content-Type: application/json; charset=UTF-8');

$config = Config::getConfig();
if(!$config->ok) output($config->data, 400);
$config = $config->data;

$url = 'https://restcountries.eu/rest/v2/'
	. Config::field2url()[$config->field]($config->searchStr)
	. 'fields=name;alpha2Code;alpha3Code;region;subregion;population;languages;flag';
session_start();
$data = NULL;
if(isset($_SESSION[$url]) && $_SESSION[$url] !== NULL && !empty($_SESSION[$url]))
{
	/* Caching API responses.
	We'd normally want to do this level of caching in a database, but that seems out of scope for this exercise,
	and besides, for the intended use cases (single user), SESSION fits the bill pretty well.
	The data has an appropriate lifetime at least. */
	$data = unserialize($_SESSION[$url]);
}else{
	$curlHandle = curl_init($url);
	if($curlHandle === false) output(Config::$curlErrStr, 500, "Couldn't initialize cURL\n");

	if(!curl_setopt_array($curlHandle,[
		CURLOPT_HTTPGET => true,
		CURLOPT_RETURNTRANSFER => true,
		CURLOPT_SSL_VERIFYPEER => false //bad, but the builtin php server fails to verify any peers without additional configuration, and the data isn't sensitive anyway
	])) output(Config::$curlErrStr, 500, formatCurlErr($curlHandle, "Couldn't set cURL options"));

	$res = curl_exec($curlHandle);
	if($res === false) output(Config::$curlErrStr, 500, formatCurlErr($curlHandle, "curl_exec failed"));
	$data = json_decode($res);
	if(curl_getinfo($curlHandle, CURLINFO_RESPONSE_CODE) == 404)
		$data = [];
	else
		if($config->fieldProducesSingleResult()) $data = [$data];
	
	$_SESSION[$url] = serialize($data);
}

/* The spec said "sorted alphabetically by name and population". I took this to mean:
- Sorted alphabetically by name, and
- For countries with the same name, sub-sorted by population.
Not so sure any 2 countries have the same name, but if they do, the country
with higher population is probably the legit one, meaning this interpretation
is more reasonable than it sounded at first.

Another close candidate was showing the list twice, once by name and once by pop.
However, that logic is slightly further away from the wording of the spec.

More useful would be having the user choose which way to sort but that would be
an even more strained interpretation.
*/
usort($data, function($a,$b){
	$aStr = $a->name . str_pad($a->population,10,'0',STR_PAD_LEFT);
	$bStr = $b->name . str_pad($b->population,10,'0',STR_PAD_LEFT);
	return strcmp($aStr,$bStr);
});

$totalCountries = count($data);
$regionTotals = [];
foreach($data as $index => $country)
{
	$reg = $country->region;
	$sub = $country->subregion;
	if(empty($reg)) $reg = 'Unspecified Region';
	if(empty($sub)) $sub = 'Unspecified Subregion';
	
	if(!isset($regionTotals[$reg])) $regionTotals[$reg] = ['total'=>0,'subregions'=>[]];
	if(!isset($regionTotals[$reg]['subregions'][$sub])) $regionTotals[$reg]['subregions'][$sub] = 0;
	++$regionTotals[$reg]['total'];
	++$regionTotals[$reg]['subregions'][$sub];
	if($index >= Config::limit)
	{
		unset($data[$index]);
		continue;
	}
	if($country->languages !== NULL)
	{
		foreach($country->languages as $langIndex => $lang)
		{
			$data[$index]->languages[$langIndex] = $data[$index]->languages[$langIndex]->name;
		}
		$data[$index]->languages = implode(', ', $data[$index]->languages);
	}
	
}

$out = [
	'total'     => $totalCountries,
	'countries' => $data,
	'regions'   => $regionTotals
];

output($out);



function formatCurlErr($curlHandle, string $context)
{
	return $context . ' - ' . curl_errno($curlHandle) . ': ' . curl_error($curlHandle) . "\n";
}

/**
* Send output as JSON and halt.
* @param out          Arbitrary data to encode as JSON
* @param responseCode If set, use this HTTP response code, otherwise accept the default.
* @param log          If set, log this string.
*/
function output($out, int $responseCode = NULL, string $log = NULL)
{
	if($responseCode !== NULL) http_response_code($responseCode);
	if($log !== NULL)          file_put_contents(Config::errorLogFilename, $log, FILE_APPEND);
	echo json_encode($out);
	exit;
}

class Config
{
	public const errorLogFilename = 'errors.log';
	public const limit = 50;
	public static $curlErrStr = 'Error contacting the REST Countries service. For more information see ' . Config::errorLogFilename;

	/**
	* Returns an array mapping fields to the corresponding URL fragment formatting function.
	* This pattern is used to avoid having to enumerate the possible fields more than once.
	* It's a function because PHP doesn't allow lambdas (or arrays thereof) to be class members.
	* @return array mapping fields to formatters
	*/
	public static function field2url()
	{
		return [
			'name'   => function(string $term){return 'name/'  . rawurlencode($term) . '?';},
			'name_f' => function(string $term){return 'name/'  . rawurlencode($term) . '?fullText=true&';},
			'code'   => function(string $term){return 'alpha/' . rawurlencode($term) . '?';}
		];
	}

	public $searchStr;
	public $field;
	
	private function __construct(string $searchStr, string $field)
	{
		$this->searchStr = $searchStr;
		$this->field = $field;
	}
	
	/**
	* Validate script input and construct config object
	* @return Config object on success, or error string on failure
	*/
	public static function getConfig()
	{
		if(!isset($_GET['searchStr']) || empty($_GET['searchStr'])) return new Result(false,'Error: Missing parameter "searchStr"');
		if(!isset($_GET['field']) || empty($_GET['field'])) return new Result(false,'Error: Missing parameter "field"');
		
		$searchStr = $_GET['searchStr'];
		$field = $_GET['field'];
		$searchLen = strlen($searchStr);
		
		if(!in_array($field, array_keys(static::field2url()))) return new Result(false,'Error: Invalid field.');
		if($field == 'code' && ($searchLen < 2 || $searchLen > 3)) return new Result(false,'Error: Code can only be 2 to 3 characters.');

		return new Result(true,new Config($searchStr, $field));
	}
	
	public function fieldProducesSingleResult()
	{
		return in_array($this->field, ['code']);
	}
}

/**
* Rust style result object.
* when ok == true, data == the requested data
* when ok == false, data == error string
*/
class Result
{
	public $ok;
	public $data;
	public function __construct(bool $ok, $data)
	{
		$this->ok = $ok;
		$this->data = $data;
	}
}

?>