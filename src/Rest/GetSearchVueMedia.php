<?php

namespace SearchVue\Rest;

use MediaWiki\Config\Config;
use MediaWiki\Http\HttpRequestFactory;
use MediaWiki\Language\Language;
use MediaWiki\Rest\Response;
use MediaWiki\Rest\SimpleHandler;
use MediaWiki\Utils\UrlUtils;
use Wikimedia\ParamValidator\ParamValidator;

/**
 * Class to retrieve media information to populate the Search Preview
 * GET /searchvue/v0/media/{qid}
 */
class GetSearchVueMedia extends SimpleHandler {

	/** @var HttpRequestFactory */
	private $httpRequestFactory;

	/** @var string|null */
	private $externalMediaSearchUri;

	/** @var string|null */
	private $externalInterwikiSearchUri;

	/** @var string|null */
	private $searchFilterForQID;

	/** @var string|null */
	private $mediaRepositorySearchUri;

	/** @var UrlUtils */
	private $urlUtils;

	/** @var Language */
	private $language;

	/** @var string */
	private $dbName;

	/** @var string[] */
	private $interwikiSites = [
		// map of i18n message to (language prefix interpolated) wiki dbname
		'wikibase-otherprojects-wikipedia' => '%swiki',
		'wikibase-otherprojects-wiktionary' => '%swiktionary',
		'wikibase-otherprojects-wikiquote' => '%swikiquote',
		'wikibase-otherprojects-wikinews' => '%swikinews',
		'wikibase-otherprojects-wikisource' => '%swikisource',
		'wikibase-otherprojects-wikibooks' => '%swikibooks',
		'wikibase-otherprojects-wikiversity' => '%swikiversity',
		'wikibase-otherprojects-wikivoyage' => '%swikivoyage',
		'wikibase-otherprojects-wikidata' => 'wikidatawiki',
		'wikibase-otherprojects-species' => 'specieswiki'
		// commonswiki excluded because we're fetching images from Commons separately;
		// other projects excluded because we're focusing on core projects:
		// https://meta.wikimedia.org/wiki/Complete_list_of_Wikimedia_projects#Core_free-knowledge_projects
	];

	/**
	 * @param Config $mainConfig
	 * @param HttpRequestFactory $httpRequestFactory
	 * @param UrlUtils $urlUtils
	 * @param Language $language
	 */
	public function __construct(
		Config $mainConfig,
		HttpRequestFactory $httpRequestFactory,
		UrlUtils $urlUtils,
		Language $language
	) {
		$this->dbName = $mainConfig->get( 'DBname' );
		$this->externalMediaSearchUri = $mainConfig->get( 'QuickViewMediaRepositoryApiBaseUri' );
		$this->externalInterwikiSearchUri = $mainConfig->get( 'QuickViewDataRepositoryApiBaseUri' );
		$this->searchFilterForQID = $mainConfig->get( 'QuickViewSearchFilterForQID' );
		$this->mediaRepositorySearchUri = $mainConfig->get( 'QuickViewMediaRepositorySearchUri' );
		$this->httpRequestFactory = $httpRequestFactory;
		$this->urlUtils = $urlUtils;
		$this->language = $language;
	}

	/**
	 * @param string $qid
	 * @return Response
	 */
	public function run( $qid ) {
		$requests = [];
		$handlers = [];

		if (
			$this->externalMediaSearchUri !== null &&
			$this->mediaRepositorySearchUri !== null &&
			$this->searchFilterForQID !== null
		) {
			$searchTerm = $this->generateSearchTerm( $qid );
			$requests['media'] = $this->getMediaRequest( $searchTerm );
			$handlers['media'] = function ( $response ) use ( $searchTerm ) {
				$data = json_decode( $response['response']['body'], true ) ?: [];
				return array_merge(
					$data,
					[ 'searchlink' => $this->generateSearchLink( $searchTerm ) ],
				);
			};
		}

		if ( $this->externalInterwikiSearchUri !== null ) {
			$sitesList = $this->getFilteredSites( $this->language->getCode(), $this->dbName );
			$requests['links'] = $this->getSitelinksRequest( $qid, $sitesList );
			$handlers['links'] = function ( $response ) use ( $sitesList ) {
				$data = json_decode( $response['response']['body'], true ) ?: [];
				$allEntities = $data[ 'entities' ] ?? [];
				$entities = reset( $allEntities );
				if ( !$entities ) {
					return [];
				}

				return $this->formatToInterwikiLinks( $entities[ 'sitelinks' ], $sitesList );
			};
		}

		$results = [];
		if ( $requests ) {
			$responses = $this->httpRequestFactory->createMultiClient()->runMulti( $requests );
			$results = $this->transformResponses( $responses, $handlers );
		}

		return $this->getResponseFactory()->createJson( $results );
	}

	/** @inheritDoc */
	public function needsWriteAccess() {
		return false;
	}

	/**
	 * Replace filter prefixes with Localized names and remove current site.
	 *
	 * @param string $languageCode
	 * @param string $dbName
	 * @return array
	 */
	private function getFilteredSites( $languageCode, $dbName ) {
		// Replace the placeholder with the wiki languages
		$sitesList = array_map( static function ( $site ) use ( $languageCode ) {
			return sprintf( $site, $languageCode );
		}, $this->interwikiSites );

		// remove the current site
		return array_diff( $sitesList, [ $dbName ] );
	}

	/**
	 * Request to retrieve commons images, to be shown in the search preview.
	 *
	 * @param string $searchTerm
	 * @return array
	 */
	private function getMediaRequest( $searchTerm ) {
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

		return [
			'method' => 'GET',
			'url' => $this->externalMediaSearchUri . '?' . http_build_query( $payload ),
		];
	}

	/**
	 * Request to retrieve sitelinks to be shown in the search preview.
	 *
	 * @param string $qid
	 * @param array $sitesList
	 * @return array
	 */
	private function getSitelinksRequest( $qid, $sitesList ) {
		$payload = [
			'action' => 'wbgetentities',
			'format' => 'json',
			'ids' => $qid,
			'props' => 'sitelinks/urls',
			'sitefilter' => implode( '|', $sitesList )
		];

		return [
			'method' => 'GET',
			'url' => $this->externalInterwikiSearchUri . '?' . http_build_query( $payload ),
		];
	}

	/**
	 * @param array $responses
	 * @param array $handlers
	 * @return array
	 */
	private function transformResponses( array $responses, array $handlers ) {
		if ( array_diff_key( $responses, $handlers ) || array_diff_key( $handlers, $responses ) ) {
			throw new \InvalidArgumentException( 'Not all requests have handlers or vice versa' );
		}

		$results = [];
		foreach ( $responses as $key => $response ) {
			$results[ $key ] = $handlers[ $key ]( $response );
		}

		return $results;
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
		return sprintf( $this->mediaRepositorySearchUri, urlencode( $searchTerm ) );
	}

	/**
	 * Add an Icon URL and localized name to all the interwiki returned by the API
	 *
	 * @param array $interwikiLinks
	 * @param array $sitesList
	 * @return array
	 */
	private function formatToInterwikiLinks( $interwikiLinks, $sitesList ) {
		return array_map( function ( $interwiki ) use ( $sitesList ) {
			$i18nKey = array_search( $interwiki[ 'site' ], $sitesList );
			$interwiki[ 'localizedName' ] = wfMessage( $i18nKey )->text();
			$interwiki[ 'icon' ] = $this->iwIconUrl( $interwiki[ 'url' ] );

			return $interwiki;
		}, $interwikiLinks );
	}

	/**
	 * Generate a favicon image URL for a given interwiki.
	 * This URL is generated by parsing the interwiki LINK object
	 * and returning the default location of the favicon for that domain,
	 * which is assumed to be '/favicon.ico'.
	 *
	 * @param string $url Interwiki url
	 * @return string
	 */
	private function iwIconUrl( $url ) {
		$expanded = $this->urlUtils->expand( $url );
		if ( !$expanded ) {
			return '';
		}

		$parsed = $this->urlUtils->parse( $expanded );
		if ( !$parsed ) {
			return '';
		}

		return $parsed['scheme'] .
			$parsed['delimiter'] .
			$parsed['host'] .
			( isset( $parsed['port'] ) ? ':' . $parsed['port'] : '' ) .
			'/favicon.ico';
	}
}
