import crypto from "crypto";
import url from "url";

export default {
  name: "pipedream",
  version: "0.0.1",
  props: {
    http: {
      type: "$.interface.http",
      customResponse: true
    },
    secKey: {
      type: "string",
      label: "Secret Key",
      secret: true
    }
  },
  async run(event) {
    function removeParams(url_og, sParam)
    {
      var url_ = url.parse(url_og).href.split('?')[0]+'?';
      var sPageURL = decodeURIComponent(url.parse(url_og).search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

      for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] != sParam) {
          url_ = url_ + sParameterName[0] + '=' + sParameterName[1] + '&'
        }
      }
      return url_.substring(0,url_.length-1);
    }

    const secret_key = this.secKey;
    const hash = event.query.hash;
    const og_url = removeParams(event.url, "hash");

    const hmac = crypto.createHmac('sha1', secret_key)
      .update(og_url)
      .digest('base64');
    const encoded_hash = hmac.replace("+", "-").replace("/","_").replace("=","").replace("\n", "");

    if (hash != encoded_hash)
      return $respond({
        status: 401, 
        body: `Provided hash does not match encoded hash.`
      });
    $respond({
      status: 200, 
      body: `Success!`
    });
    const emittedEvent = event.query;

    return this.$emit(emittedEvent, {
      id: encoded_hash,
      ts: Date.now()
    });
  }
};
