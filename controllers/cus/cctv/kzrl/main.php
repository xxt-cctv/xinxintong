<?php
namespace cus\cctv\kzrl;

require_once dirname(dirname(dirname(dirname(__FILE__)))).'/xxt_base.php';
/**
 * 抗战日历 
 */
class main extends \xxt_base {
    /**
     *
     */
    public function get_access_rule() 
    {
        $rule_action['rule_type'] = 'black';
        $rule_action['actions'] = array();

        return $rule_action;
    }
    /**
     * 求两个已知经纬度之间的距离,单位为米
     * @param lng1,lng2 经度
     * @param lat1,lat2 纬度
     * @return float 距离，单位米
     * @author www.Alixixi.com
    **/
    private function calcDistance($lng1, $lat1, $lng2, $lat2){
    	//将角度转为狐度
    	$radLat1 = deg2rad($lat1);//deg2rad()函数将角度转换为弧度
    	$radLat2 = deg2rad($lat2);
    	$radLng1 = deg2rad($lng1);
    	$radLng2 = deg2rad($lng2);
    	$a = $radLat1 - $radLat2;
    	$b = $radLng1 - $radLng2;
    	$s = 2 * asin(sqrt(pow(sin($a/2),2) + cos($radLat1) * cos($radLat2) * pow(sin($b/2),2))) * 6378.137 * 1000;
        
    	return $s;
    }
    /**
     * 获得一篇文章的详细信息
     *
     * $articleid
     * $lat 纬度
     * $lng 经度
     */
    public function get_action($articleid, $lat=null, $lng=null)
    {
        $q = array(
            'a.id,a.title,a.summary,a.pic,a.body,a.weight,e.occured_time,e.occured_year,e.occured_month,e.occured_day,e.occured_place,e.occured_lat,e.occured_lng',
            'xxt_article a, xxt_article_extinfo e',
            "a.id=$articleid and a.id=e.article_id"
        );
        $article = $this->model()->query_obj_ss($q);
        if ($lat !== null && $lng !== null) {
            $distance = $this->calcDistance($lng, $lat, $article->occured_lng, $article->occured_lat);
            $article->distance = $distance;    
        }
        
        return new \ResponseData($article);
    }
    /**
     * 获得历史上今天发生的事件
     */
    public function today_action($current=null)
    {
        $current === null && $current = time();
        
        $day = date('j', $current);
        $month = date('n', $current);
        
        $q = array(
            'a.id,a.title,a.summary,a.pic,a.weight,e.occured_time,e.occured_year,e.occured_month,e.occured_day',
            'xxt_article a, xxt_article_extinfo e',
            "a.id=e.article_id and e.occured_month=$month and e.occured_day=$day"
        );
        $q2 = array(
            'o'=>'e.occured_time desc'
        );
        
        $articles = $this->model()->query_objs_ss($q, $q2);
        
        return new \ResponseData($articles);
    }
    /**
     * 按照事件轴列出历史事件
     *
     * $articleid 以哪篇文章作为基准
     * $direction Backword|Two-way|Forward
     * $size 一个方向上的查找数量
     */
    public function timeline_action($articleid=null, $current=null, $direction='T', $size=10)
    {
        $result = array();
        
        if ($articleid === null) {
            $start = $current === null ? time() : $current;
            $month = date('n', $start);
            $day = date('j', $start);
            $q = array(
                "occured_time,ABS( occured_day -$day ) days",
                'xxt_article_extinfo', 
                "occured_month=$month"
            );
            $q2 = array(
                'o' => 'days',
                'r' => array('o'=>0, 'l'=>1),
            );
            $lastest = $this->model()->query_objs_ss($q, $q2);
            $lastest = $lastest[0];
            $start = $lastest->occured_time; 
        } else {
            $q = array(
                'e.occured_time',
                'xxt_article_extinfo e',
                "e.article_id=$articleid"    
            );
            $start = $this->model()->query_val_ss($q);
        }
        $day = date('j', $start);
        $month = date('n', $start);
        /**
         * forwards
         */
        if ($direction === 'T' || $direction === 'F') {
            $q = array(
                'a.id,a.title,a.summary,a.weight,e.occured_time,e.occured_year,e.occured_month,e.occured_day',
                'xxt_article a, xxt_article_extinfo e',
                "a.id=e.article_id and e.occured_time>$start"
            );
            $q2 = array(
                'o'=>'e.occured_time asc',
                'r'=>array('o'=>'0','l'=>$size)
            );
            
            if ($forwards = $this->model()->query_objs_ss($q, $q2)) {
                $forwards = array_reverse($forwards);
            }
            $result = $forwards;
        }
        /**
         * backwards
         */
        $todayIndex = -1;
        if ($direction === 'T' || $direction === 'B') {
            $q = array(
                'a.id,a.title,a.summary,a.weight,e.occured_time,e.occured_year,e.occured_month,e.occured_day',
                'xxt_article a, xxt_article_extinfo e',
                "a.id=e.article_id and e.occured_time"
            );
            $q[2] .= $articleid !== null ? "<$start" : "<=$start";
             
            $q2 = array(
                'o'=>'e.occured_time desc',
                'r'=>array('o'=>'0','l'=>$size)
            );
            
            $backwards = $this->model()->query_objs_ss($q, $q2);
            /**
             * 按照当前时间获得数据时，需要指定当前天的索引
             */
            $direction === 'T' && $todayIndex = count($result);
            
            $result = array_merge($result, $backwards);
        }
        
        return new \ResponseData(array('result'=>$result, 'todayIndex'=>$todayIndex));
    }
    /**
     * 查某一事件附近的事件
     */    
    public function nearby_action($articleid, $size=10)
    {
        $q = array(
            'a.id,a.title,a.summary,a.weight,e.occured_time,e.occured_year,e.occured_month,e.occured_day,d.distance',
            'xxt_article a, xxt_article_extinfo e, xxt_article_ext_distance d',
            "d.article_id_a=$articleid and a.id=e.article_id and a.id=d.article_id_b"
        );
        $q2 = array(
            'o' => 'd.distance asc',
            'r' => array('o' => 0, 'l' => $size)
        );
        
        $nearbys = $this->model()->query_objs_ss($q, $q2);
        
        return new \ResponseData($nearbys);
    }
    /**
     * 导入事件数据
     */
    public function import_action($mpid, $cleanExistent = 'N')
    {
        empty($mpid) && die('mpid is emtpy.');
        
        if ($cleanExistent === 'Y') {
            $this->model()->delete('xxt_article', "mpid='$mpid' and creater='import'");
            $this->model()->delete('xxt_article_extinfo', '1=1');
            $this->model()->delete('xxt_article_ext_distance', '1=1');
        }
        
        @set_time_limit(0);

        if (!($file = fopen($_FILES['kzrl']['tmp_name'], "r")))
            return new \ResponseError('open file, failed.');
        /**
         * handle data.
         */
        $picurl = 'http://'.$_SERVER['HTTP_HOST'].'/kcfinder/upload/'.$mpid.urlencode('/图片/抗战日历');
        
        $current = time();
        for ($row = 0; ($record = fgetcsv($file)) != false; $row++) {
            /**
             * remove BOM
             */
            $row === 0 && $record[0] = preg_replace('/\xEF\xBB\xBF/', '', $record[0]);
            /**
             * date
             */
            empty($record[3]) && die("error[$row]: time empty: " . $record[0]);
            $occured_time = $record[3];
            $occured_time = str_replace(array('年','月'), '/', $occured_time);
            $occured_time = str_replace('日', '', $occured_time);
            list($year, $mon, $day) = explode('/', $occured_time);
            $occured_time = strtotime($year.'-'.$mon.'-'.$day);
            /**
             * location
             */
            $occured_point = trim($record[5]);
            $occured_point = str_replace(array('\'',' '), '', $occured_point);
            $occured_point = str_replace(array('北纬','南纬','东经','西经'), array('','-',',',',-'), $occured_point);
            list($lat, $lng) = explode(',', $occured_point);
            !preg_match('/(\d+)\S+(\d+)\S+(\d+)/', $lat, $lats) && die("error[$row]: ".$record[0].': '.$lat);
            $lat = (int)$lats[0] + $lats[1] / 60 + $lats[2] / 3600;
            !preg_match('/(\d+)\S+(\d+)\S+(\d+)/', $lng, $lngs) && die("error[$row]: ".$record[0].': '.$lng);
            $lng = (int)$lngs[0] + $lngs[1] / 60 + $lngs[2] / 3600;
            /**
             *
             */
            $a = array(
                'mpid' => $mpid,
                'pic' => $picurl.'/'.sprintf("%'.02d", $mon).'/'.$record[0].'.jpg',
                'url' => '',
                'title' => $record[1],
                'summary' => $record[2],
                'create_at' => $current,
                'modify_at' => $current,
                'body' => $record[6],
                'creater' => 'import',
                'creater_name' => 'import'
            );
            $articleid = $this->model()->insert('xxt_article', $a, true);
            $ei = array();
            $ei = array(
                'article_id' => $articleid,
                'occured_time' => $occured_time,
                'occured_year' => $year,
                'occured_month' => $mon,
                'occured_day' =>$day,
                'occured_lat' => $lat,
                'occured_lng' => $lng,    
                'occured_place' => $record[4]    
            );
            $this->model()->insert('xxt_article_extinfo', $ei, false);
        }

        if (!feof($file)) {
            return new \ResponseError('unexpected fgets() fail.');
        }
        fclose($file);

        return new \ResponseData($row);
    }
    /**
     * 计算事件之间的距离
     */
    public function precalc_action($count=5)
    {
        @set_time_limit(0);

        $this->model()->delete('xxt_article_ext_distance', '1=1');

        $q = array(
            'e.article_id id,e.occured_lng lng,e.occured_lat lat',
            'xxt_article_extinfo e'  
        );
        $all = $this->model()->query_objs_ss($q);
        $all2 = $all;
        foreach ($all as $a) {
            foreach ($all2 as $b) {
                if ($a->id === $b->id) continue;
                $d = $this->calcDistance($a->lng, $a->lat, $b->lng, $b->lat);
                $this->model()->insert(
                    'xxt_article_ext_distance', 
                    array('article_id_a'=>$a->id, 'article_id_b'=>$b->id, 'distance'=>$d)
                );
            }
        }
        
        return new \ResponseData('ok');
    }
}
