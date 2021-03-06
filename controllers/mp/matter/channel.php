<?php
namespace mp\matter;

require_once dirname(__FILE__).'/matter_ctrl.php';

class channel extends matter_ctrl {
    /**
     *
     */
    public function index_action($acceptType=null, $cascade='y') 
    {
        return $this->get_action($acceptType, $cascade);
    }
    /**
     *
     * $src 是否从父账号获取资源
     * $acceptType
     * $cascade 是否获得频道内的素材和访问控制列表
     */
    public function get_action($acceptType=null, $cascade='y') 
    {
        $options = $this->getPostJson();
        
        $uid = \TMS_CLIENT::get_client_uid();
        /**
         * 素材的来源
         */
        $mpid = (!empty($options->src) && $options->src==='p') ? $this->getParentMpid() : $this->mpid;

        $q = array(
            "c.*,a.nickname creater_name,'$uid' uid",
            'xxt_channel c,account a', 
            "c.mpid='$mpid' and c.state=1 and c.creater=a.uid"
        );
        if (!empty($acceptType))
            $q[2] .= " and (matter_type='' or matter_type='$acceptType')";
        /**
         * 仅限作者和管理员？
         */
        if (!$this->model('mp\permission')->isAdmin($mpid, $uid, true)) {
            $visible = $this->model()->query_value('matter_visible_to_creater', 'xxt_mpsetting', "mpid='$mpid'");
            if ($visible === 'Y')
                $q[2] .= " and (creater='$uid' or public_visible='Y')";
        }

        $q2['o'] = 'create_at desc';
        $channels = $this->model()->query_objs_ss($q, $q2);
        /**
         * 获得子资源
         */
        if ($channels && $cascade == 'y') {
            foreach ($channels as $c) {
                /**
                 * matters
                 */
                $c->matters = $this->model('matter\channel')->getMatters($c->id, $c);
                /**
                 * acl
                 */
                $c->acl = $this->model('acl')->byMatter($mpid, 'channel', $c->id);
            }
        }

        return new \ResponseData($channels);
    }
    /**
     * 获得频道的子资源
     * 如果频道是父账号的频道,只应该列出父账号和当前账号的素材
     */
    public function cascade_action($id) 
    {
        $model = $this->model('matter\channel');
        /**
         *
         */
        $channel = $model->byId($id);
        /**
         * matters
         */
        $c['matters'] = $model->getMatters($id, $channel, $this->mpid);
        /**
         * acl
         */
        $c['acl'] = $this->model('acl')->byMatter($channel->mpid, 'channel', $id);

        return new \ResponseData($c);
    }
    /**
     * 创建一个平道素材
     */
    public function create_action()
    {
        $uid = \TMS_CLIENT::get_client_uid();

        $d = (array)$this->getPostJson();

        $d['mpid'] = $this->mpid;
        $d['creater'] = $uid;
        $d['create_at'] = time();
        $id = $this->model()->insert('xxt_channel', $d, true);

        $q = array(
            "c.*,a.nickname creater_name,'$uid' uid",
            'xxt_channel c,account a', 
            "c.id=$id and c.creater=a.uid"
        );
        $channel = $this->model()->query_obj_ss($q);

        return new \ResponseData($channel);
    }
    /**
     * 更新频道的属性信息
     *
     * $id channel's id
     * $nv pair of name and value
     */
    public function update_action($id) 
    {
        $nv = $this->getPostJson();

        $rst = $this->model()->update('xxt_channel', 
            (array)$nv,
            "mpid='$this->mpid' and id=$id"
        );

        return new \ResponseData($rst);
    }
    /**
     *
     * $id channel's id.
     * $pos top|bottom
     *
     * post
     * $t matter's type.
     * $id matter's id.
     *
     */
    public function setfixed_action($id, $pos) 
    {
        $matter = $this->getPostJson();

        if ($pos === 'top') {
            $this->model()->update('xxt_channel', 
                array(
                    'top_type'=>$matter->t,
                    'top_id'=>$matter->id
                ),
                "mpid='$this->mpid' and id=$id"
            );
        } else if ($pos === 'bottom') {
            $this->model()->update('xxt_channel', 
                array(
                    'bottom_type'=>$matter->t, 
                    'bottom_id'=>$matter->id
                ),
                "mpid='$this->mpid' and id=$id"
            );
        }

        $matters = $this->model('matter\channel')->getMatters($id);

        return new \ResponseData($matters);
    }
    /**
     *
     */
    public function addMatter_action() 
    {
        $relations = $this->getPostJson();

        $creater = \TMS_CLIENT::get_client_uid();
        $createrName = \TMS_CLIENT::account()->nickname;

        $channels = $relations->channels;
        $matter = $relations->matter;

        $model = $this->model('matter\channel');
        foreach ($channels as $channel)
            $model->addMatter($channel->id, $matter, $creater, $createrName);

        return new \ResponseData('success');
    }
    /**
     *
     */
    public function removeMatter_action($id, $reload='N') 
    {
        $matter = $this->getPostJson();

        $model = $this->model('matter\channel');

        $rst = $model->removeMatter($id, $matter);

        if ($reload === 'Y') {
            $matters = $model->getMatters($id);
            return new \ResponseData($matters);
        } else {
            return new \ResponseData($rst);
        }
    }
    /**
     * 删除频道
     */
    public function delete_action($id)
    {
        $rst = $this->model()->update('xxt_channel', array('state'=>0), "mpid='$this->mpid' and id=$id");

        return new \ResponseData($rst);
    }
    /**
     *
     */
    protected function getMatterType()
    {
        return 'channel';
    }
}
