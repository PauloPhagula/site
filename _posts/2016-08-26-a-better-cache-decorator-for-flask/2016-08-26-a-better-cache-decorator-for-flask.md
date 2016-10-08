---
layout: post
title:  "Improving the flask cache decorator"
excerpt: ""
date:   2016-08-26 00:00:00 +0200
categories: Coding
tags: flask
---

In my rumblings developing flask applications I found the [caching decorator](http://flask.pocoo.org/docs/0.11/patterns/viewdecorators/#caching-decorator).
The decorator is a short and well-written piece of code, but I feel like it misses the few points bellow:

- It only caches on the server side and doesn't leverage the client-side cache - meaning that clients still have to go and hit the server every single time they require a resource
- It doesn't respect the `no-cache` requirement from the client (although I understand why one may not want this, as it would mean busting cache every single time someone asks for it, thus creating the possibility of reducing the caching effort and benefits to zero)

The way I try to improve it is by having a decorator that easily allows me to
define a caching-control policy per view, that involes both the client-side and
server-side, by following the flow-chart bellow, taken from the [HTTP Caching](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/http-caching)
article by Google Guru [Ilya Grigorik](https://www.igvita.com/)

![HTTP cache decision tree](http-cache-decision-tree.png)

> Talk is cheap. Show me the code. (Linus Torvalds)

```python
import binascii
import datetime
from flask import Response, make_response
def cached(cacheable = False, must_revalidate = True, client_only = True, client_timeout = 0, server_timeout = 5 * 60, key='view/%s'):
"""

@see https://jakearchibald.com/2016/caching-best-practices/
    https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/http-caching
"""
def decorator(f):
  @wraps(f)
  def decorated_function(*args, **kwargs):
    cache_key = key % request.full_path # include querystring
    cache_policy = ''
    etag = ''
    if not cacheable:
      cache_policy += ', no-store' # tells the browser not to cache at all
    else:
      if must_revalidate: # this looks contradicting if you haven't read the article.
        # no-cache doesn't mean "don't cache", it means it must check
        # (or "revalidate" as it calls it) with the server before
        # using the cached resource
        cache_policy += ', no-cache'
      else:
        # Also must-revalidate doesn't mean "must revalidate", it
        # means the local resource can be used if it's younger than
        # the provided max-age, otherwise it must revalidate
        cache_policy += ', must-revalidate'

      if client_only:
        cache_policy += ', private'
      else:
        cache_policy += ', public'

      cache_policy += ', max-age=%d' % (client_timeout)

    headers = {}
    cache_policy = cache_policy.strip(',')
    headers['Cache-Control'] = cache_policy
    now = datetime.datetime.utcnow()

    client_etag = request.headers.get('If-None-Match')

    response = cache.get(cache_key)
    # respect the hard-refresh
    if response is not None and request.headers.get('Cache-Control', '') != 'no-cache':
      headers['X-Cache'] = 'HIT from Server'
      cached_etag = response.headers.get('ETag')
      if client_etag and cached_etag and client_etag == cached_etag:
        headers['X-Cache'] = 'HIT from Client'
        headers['X-Last-Modified'] = response.headers.get('X-LastModified')
        response = make_response('', 304)
    else:
      response = make_response(f(*args, **kwargs))
      if response.status_code == 200 and request.method in ['GET', 'HEAD']:
        headers['X-Cache'] = 'MISS'
        # - Added the headers to the response object instead of the
        # headers dict so they get cached too
        # - If you can find any faster random algorithm go for it.
        response.headers.add('ETag', binascii.hexlify(os.urandom(4)))
        response.headers.add('X-Last-Modified', str(now))
        cache.set(cache_key, response, timeout=server_timeout)

    response.headers.extend(headers)
    return response
  return decorated_function
return decorator

```

Then in your views you can use it like

```python
@pages.route('/')
@cached(True, must_revalidate=True, client_only=False, client_timeout=120, server_timeout=5*60)
def index():
  """Serve client-side application shell."""
  return render_template('shell.html', model = get_default_model())
```

**Note**

> Google Chrome doesn't function correctly, it doesn't send the `If-None-Match` header effectlively not allowing the client-side cache to be used at all. Maybe it's a problem with dev-tools. So better test with Firefox Developer Edition

Last but not least, the way I deal with static content like javascript and css,
is by using far-future expiration dates and changing the URL by overriding the `url_for`
function to include the modified date of the file on disk.
That way, cache busting is already done from the moment I save the file..
