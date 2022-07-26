<?php

namespace SearchVue;

use MediaWiki\MediaWikiServices;
use MediaWiki\SpecialPage\Hook\SpecialPageBeforeExecuteHook;
use SearchResultSet;
use SpecialPage;

/**
 * @license GPL-2.0-or-later
 */

class Hooks implements
	SpecialPageBeforeExecuteHook
{
	/**
	 * @var array holding the search result object.
	 */
	private $textMatches;

	/**
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/SpecialPageBeforeExecute
	 *
	 * @param SpecialPage $special
	 * @param string|null $subpage
	 * @return false|void false to abort the execution of the special page, "void" otherwise
	 */
	public function onSpecialPageBeforeExecute( $special, $subpage ) {
		if ( $special->getName() !== 'Search' ) {
			return;
		}

		$services = MediaWikiServices::getInstance();

		$mainConfig = $special->getConfig();

		$special->getOutput()->addModules( [
			'searchVue'
		] );
	}

	/**
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/SpecialSearchResults
	 *
	 * @param string $term Search term
	 * @param SearchResultSet|null $titleMatches
	 * @param SearchResultSet|null $textMatches
	 * @return bool|void True or no return value to continue or false to abort
	 */
	public function onSpecialSearchResults( $term, $titleMatches, $textMatches ) {
		$this->textMatches = $this->formatResult( $textMatches );
	}

	/**
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/SpecialSearchResultsAppend
	 *
	 * @param SpecialSearch $special SpecialSearch object ($this)
	 * @param OutputPage $out $wgOut
	 * @param string $term Search term specified by the user
	 * @return bool|void True or no return value to continue or false to abort
	 */
	public function onSpecialSearchResultsAppend( $special, $out, $term ) {
		if ( $special->getName() !== 'Search' ) {
			return;
		}

		$out->addJsConfigVars(
			[
				'wgSpecialSearchTextMatches' => $this->textMatches,
			]
		);
	}

	/**
	 * Extract the searchResult information required by the extension UI
	 *
	 * @param SearchResultSet|null $resultSet
	 * @return array
	 */
	private function formatResult( $resultSet ) {
		if ( !$resultSet ) {
			return [];
		}

		$formattedResultSet = [];

		foreach ( $resultSet as $result ) {
			if ( $result->getTitle() !== '' ) {
				$formattedResult = $result->getTitle();
				$formattedResult->text = $result->getTextSnippet();
				$formattedResultSet[] = $formattedResult;
			}
		}

		return $formattedResultSet;
	}
}
