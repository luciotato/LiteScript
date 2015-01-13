to run this code: 
<pre>
cd ~/LiteScript/doc 
lite blog-example-dns.lite.md
cd generated/js
node -harmony blog-example-dns.js
</pre>
Note: You need at least node v0.11.6

#####get google.com IPs, reverse DNS (in parallel)

    import dns, nicegen

    nice function resolveAndParallelReverse

        try

            var domain = "google.com"

            var addresses:array = yield until dns.resolve domain

            var results = yield parallel map addresses dns.reverse 

            for each index,addr in addresses
                print "#{addr} reverse: #{results[index]}"

        catch err
            print "caught:", err.stack

    end nice function

    resolveAndParallelReverse
    
