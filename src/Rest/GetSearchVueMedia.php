<?php

namespace SearchVue\Rest;

use Config;
use MediaWiki\Http\HttpRequestFactory;
use MediaWiki\Rest\Response;
use MediaWiki\Rest\SimpleHandler;
use Wikimedia\ParamValidator\ParamValidator;

/**
 * Class to retrieve media information to populate the Search Preview
 * GET /searchvue/v0/media/{qid}
 */
class GetSearchVueMedia extends SimpleHandler {

	/** @var HttpRequestFactory */
	private $httpRequestFactory;

	/** @var string */
	private $externalSearchUri;

	/** @var string */
	private $searchFilterForQID;

	/** @var string */
	private $repositorySearchUri;

	/**
	 * @param Config $mainConfig
	 * @param HttpRequestFactory $httpRequestFactory
	 */
	public function __construct(
		Config $mainConfig,
		HttpRequestFactory $httpRequestFactory
	) {
		$this->externalSearchUri = $mainConfig->get( 'QuickViewMediaRepositoryApiBaseUri' );
		$this->searchFilterForQID = $mainConfig->get( 'QuickViewSearchFilterForQID' );
		$this->repositorySearchUri = $mainConfig->get( 'QuickViewMediaRepositorySearchUri' );
		$this->httpRequestFactory = $httpRequestFactory;
	}

	/**
	 * @param string $qid
	 * @return Response
	 */
	public function run( $qid ) {
		$searchTerm = $this->generateSearchTerm( $qid );
		$payload = [
			'action' => 'query',
			'format' => 'json',
			'generator' => 'search',
			'gsrsearch' => 'filetype:bitmap|drawing -fileres:0 ' . $searchTerm,
			'gsrnamespace' => NS_FILE,
			'gsrlimit' => 7,
			'prop' => 'imageinfo',
			'iiprop' => 'url',
			'iiurlwidth' => 400
		];

		$url = $this->externalSearchUri . '?' . http_build_query( $payload );
		$request = $this->httpRequestFactory->create( $url, [], __METHOD__ );
		$request->execute();
		$data = $request->getContent();
		$response = json_decode( $data, true ) ?: [];
		$response[ 'searchlink' ] = $this->generateSearchLink( $searchTerm );

		return $this->getResponseFactory()->createJson( $response );
	}

	public function needsWriteAccess() {
		return false;
	}

	/**
	 * @inheritDoc
	 */
	public function getParamSettings() {
		return [
			'qid' => [
				self::PARAM_SOURCE => 'path',
				ParamValidator::PARAM_TYPE => 'string',
				ParamValidator::PARAM_REQUIRED => true,
			],
		];
	}

	/**
	 * Generate the search term using configuration settings
	 * @param string $qid
	 * @return string
	 */
	private function generateSearchTerm( $qid ) {
		return sprintf( $this->searchFilterForQID, $qid );
	}

	/**
	 * Generate the search link using the search term.
	 * @param string $searchTerm
	 * @return string
	 */
	private function generateSearchLink( $searchTerm ) {
		return sprintf( $this->repositorySearchUri, urlencode( $searchTerm ) );
	}
}
