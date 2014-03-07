to run this code:

lite -es6 -r blog-example-dns.lite.md

#####get google.com IPs, reverse DNS (in parallel)

    global import dns, nicegen

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
    