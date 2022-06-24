<?php

namespace SearchVue;

use MediaWiki\MediaWikiServices;
use MediaWiki\SpecialPage\Hook\SpecialPageBeforeExecuteHook;
use SpecialPage;

/**
 * @license GPL-2.0-or-later
 */

class Hooks implements
	SpecialPageBeforeExecuteHook
{
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
}
