<?php

namespace SearchVue\Rest;

use ApiMain;
use DerivativeContext;
use FauxRequest;
use MediaWiki\Rest\Response;
use MediaWiki\Rest\SimpleHandler;
use RequestContext;
use Wikimedia\ParamValidator\ParamValidator;

/**
 * Example class to retrieve page information to populate the Search Preview
 * GET /searchvue/v0/page/{page_title}/{snippet_field}
 */
class GetSearchVueResultInfo extends SimpleHandler {

	/**
	 * @param string $pageTitle
	 * @return Response
	 */
	public function run( $pageTitle ) {
		$decodedTitle = rawurldecode( $pageTitle );
		$payload = new FauxRequest( [
			'action' => 'query',
			'format' => 'json',
			'titles' => $decodedTitle,
			'prop' => 'pageimages|pageprops|cirrusdoc',
			'pithumbsize' => 400,
			'pilicense' => 'free',
			'piprop' => 'thumbnail|name|original',
			'cdincludes' => 'heading'
		] );
		$api = new ApiMain( $payload );
		$context = new DerivativeContext( RequestContext::getMain() );
		$context->setRequest( $payload );
		$api->setContext( $context );
		$api->execute();
		$response = $api->getResult()->getResultData( [], [ 'Strip' => 'all' ] );

		return $this->getResponseFactory()->createJson( reset( $response[ 'query' ][ 'pages' ] ) );
	}

	public function needsWriteAccess() {
		return false;
	}

	/**
	 * @inheritDoc
	 */
	public function getParamSettings() {
		return [
			'page_title' => [
				self::PARAM_SOURCE => 'path',
				ParamValidator::PARAM_TYPE => 'string',
				ParamValidator::PARAM_REQUIRED => true,
			],
		];
	}
}
