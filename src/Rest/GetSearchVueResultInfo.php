<?php

namespace SearchVue\Rest;

use MediaWiki\Api\ApiMain;
use MediaWiki\Context\DerivativeContext;
use MediaWiki\Context\RequestContext;
use MediaWiki\Request\FauxRequest;
use MediaWiki\Rest\Response;
use MediaWiki\Rest\SimpleHandler;
use Wikimedia\ParamValidator\ParamValidator;

/**
 * Class to retrieve page information to populate the Search Preview
 * GET /searchvue/v0/page/{page_title}/{snippet_field}
 */
class GetSearchVueResultInfo extends SimpleHandler {

	/** @var string */
	private $snippetField;

	/** @var string */
	private $pageTitle;

	/**
	 * @param string $pageTitle
	 * @param string $snippetField
	 * @return Response
	 */
	public function run( $pageTitle, $snippetField ) {
		$decodedSnippetField = rawurldecode( $snippetField );
		$this->pageTitle = rawurldecode( $pageTitle );
		$this->snippetField = $decodedSnippetField;

		$payload = new FauxRequest( [
			'action' => 'query',
			'format' => 'json',
			'titles' => $this->pageTitle,
			'prop' => 'pageimages|pageprops|pageterms|cirrusdoc|extracts',
			'pithumbsize' => 400,
			'pilicense' => 'free',
			'piprop' => 'thumbnail|name|original',
			'wbptterms' => 'description',
			'cdincludes' => "heading|{$this->snippetField}",
			'exsentences' => 1,
			'explaintext' => true
		] );
		$api = new ApiMain( $payload );
		$context = new DerivativeContext( RequestContext::getMain() );
		$context->setRequest( $payload );
		$api->setContext( $context );
		$api->execute();
		$response = $api->getResult()->getResultData( [], [ 'Strip' => 'all' ] );
		$formattedResponse = reset( $response[ 'query' ][ 'pages' ] );

		return $this->getResponseFactory()->createJson( $formattedResponse );
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
			'snippet_field' => [
				self::PARAM_SOURCE => 'path',
				ParamValidator::PARAM_TYPE => 'string',
				ParamValidator::PARAM_REQUIRED => true,
			],
		];
	}
}
