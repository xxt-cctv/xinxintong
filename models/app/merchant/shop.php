<?php
namespace app\merchant;

/**
 *
 */
class shop_model extends \TMS_MODEL {
	/**
	 * $mpid
	 */
	public function &byMpid($mpid)
	{
		$q = array(
			'*', 
			'xxt_merchant_shop s',
			"mpid='$mpid'"
		);
		$q2 = array('o'=>'create_at desc');
		
		$shops = $this->query_objs_ss($q, $q2);
		
		return $shops;
	}
}
