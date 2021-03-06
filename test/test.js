/*global describe, it, beforeEach*/

define([
    'expect',
    'src/EventsEmitter'
], function (expect, EventsEmitter) {

    'use strict';

    describe('EventsEmitter', function () {
        var emitter,
            stack = [],
            args = [],
            context = {};

        beforeEach(function () {
            emitter = new EventsEmitter();
            stack = [];
            args = [];
        });

        describe('.on()', function () {
            it('should add the specified listener to an event', function () {
                emitter.on('click', function (arg1, arg2, arg3) {
                    stack.push('one');
                    if (arg1) {
                        args.push(arg1);
                    }
                    if (arg2) {
                        args.push(arg2);
                    }
                    if (arg3) {
                        args.push(arg3);
                    }
                });

                emitter.on('click', function (arg1, arg2, arg3) {
                    stack.push('two');

                    if (arg1) {
                        args.push(arg1);
                    }
                    if (arg2) {
                        args.push(arg2);
                    }
                    if (arg3) {
                        args.push(arg3);
                    }
                });

                emitter.on('click_dummy', function () {
                    stack.push('dummy');
                });


                emitter.emit('click', 1, 2, 3);

                expect(stack).to.eql(['one', 'two']);
                expect(args).to.eql([1, 2, 3, 1, 2, 3]);
            });

            it('should be able to specify the desired context', function () {
                emitter.on('click', function () {
                    expect(this).to.be.equal(context);
                }, context);

                emitter.emit('click');
            });

            it('should not duplicate the same listener', function () {
                function SomeClass() {}

                SomeClass.prototype.foo = function () {
                    stack.push('foo');
                };

                var listener = function () {
                    stack.push('listener');
                },
                    some1 = new SomeClass(),
                    some2 = new SomeClass();

                emitter.on('other', listener);
                emitter.on('other', listener);
                emitter.emit('other');

                emitter.on('foo', some1.foo, some1);
                emitter.on('foo', some2.foo, some2);

                emitter.emit('foo');

                expect(stack).to.eql(['listener', 'foo', 'foo']);
            });
        });

        describe('.once(event, fn, $context)', function () {
            it('should listen only once', function () {
                emitter.on('click', function () {
                    stack.push('one');
                });

                emitter.once('click', function () {
                    stack.push('two');
                });

                emitter.emit('click');
                emitter.emit('click');

                expect(stack).to.eql(['one', 'two', 'one']);
            });

            it('should be equal to on()', function () {
                expect(emitter.once).to.be(emitter.one);
            });
        });

        describe('.off(event, fn, $context)', function () {
            it('should remove the specified listener', function () {
                var listener = function () {
                        stack.push('listener');
                    },
                    other = function () {
                        stack.push('other');
                    },
                    once = function () {
                        stack.push('once');
                    },
                    context = {};

                emitter.on('dummy', listener);
                emitter.on('click', listener, context);
                emitter.on('click', other);
                emitter.once('click', once, context);
                emitter.once('click', once);
                emitter.off('click', listener);
                emitter.off('click', once);
                emitter.off('click', once, context);
                emitter.emit('click');
                emitter.off('click', listener, context);
                emitter.emit('click');
                emitter.off('click', other);
                emitter.emit('click');

                emitter.emit('dummy');

                expect(stack).to.eql(['listener', 'other', 'other', 'listener']);
            });
        });

        describe('.off($event.namespace, fn, $context)', function () {
            it('should remove the specified listener', function () {
                var listener = function () {
                        stack.push('listener');
                    },
                    other = function () {
                        stack.push('other');
                    },
                    once = function () {
                        stack.push('once');
                    },
                    context = {};

                emitter.on('dummy.foo', listener);
                emitter.on('click.foo', listener, context);
                emitter.on('click.foo', other);
                emitter.once('click.foo', once, context);
                emitter.once('click.foo', once);
                emitter.off('click.foo', listener);
                emitter.off('click.foo', once);
                emitter.off('click.foo', once, context);
                emitter.emit('click');
                emitter.off('click.foo', listener, context);
                emitter.emit('click');
                emitter.off('click.foo', other);
                emitter.emit('click');

                emitter.emit('dummy');

                expect(stack).to.eql(['listener', 'other', 'other', 'listener']);
            });

            it('should remove the specified listener, just by its namespace', function () {
                var listener = function () {
                        stack.push('listener');
                    },
                    other = function () {
                        stack.push('other');
                    },
                    once = function () {
                        stack.push('once');
                    },
                    context = {};

                emitter.on('dummy.foo', listener);
                emitter.on('click.foo', listener, context);
                emitter.on('click.foo', other);
                emitter.once('click.foo', once, context);
                emitter.once('click.foo', once);
                emitter.off('click.foo', listener);
                emitter.off('.foo', once);
                emitter.off('.foo', once, context);
                emitter.emit('click');
                emitter.off('.foo', listener, context);
                emitter.emit('click');
                emitter.off('.foo', other);
                emitter.emit('click');

                emitter.emit('dummy');

                expect(stack).to.eql(['listener', 'other', 'other', 'listener']);
            });
        });

        describe('.off($event)', function () {
            var listener1 = function () {
                stack.push('listener1');
            },
                listener2 = function () {
                    stack.push('listener2');
                },
                listener3 = function () {
                    stack.push('listener3');
                };

            it('should remove all the listeners of a given event', function () {
                emitter.on('click', listener1);
                emitter.on('click', listener2);
                emitter.on('dummy', listener3);

                emitter.emit('click');
                emitter.emit('dummy');
                emitter.off('click');
                emitter.emit('click');
                emitter.emit('dummy');

                expect(stack).to.eql(['listener1', 'listener2', 'listener3', 'listener3']);
            });

            it('should remove all the listeners (if no event is specified)', function () {
                emitter.on('click', listener1);
                emitter.on('click', listener2);
                emitter.on('dummy', listener3);

                emitter.emit('click');
                emitter.emit('dummy');
                emitter.off();
                emitter.emit('click');
                emitter.emit('dummy');

                expect(stack).to.eql(['listener1', 'listener2', 'listener3']);
            });
        });

        describe('.off($event.namespace)', function () {
            var listener1 = function () {
                stack.push('listener1');
            },
                listener2 = function () {
                    stack.push('listener2');
                },
                listener3 = function () {
                    stack.push('listener3');
                };

            it('should remove all the listeners of a given event just on the passed namespace', function () {
                emitter.on('click', listener1);
                emitter.on('click.foo', listener2);
                emitter.on('dummy', listener3);

                emitter.emit('click');
                emitter.emit('dummy');
                emitter.off('click.foo');
                emitter.emit('click');
                emitter.emit('dummy');

                expect(stack).to.eql(['listener1', 'listener2', 'listener3', 'listener1', 'listener3']);
            });


            it('should remove all the listeners of the namespace (if no event is specified)', function () {
                emitter.on('click', listener1);
                emitter.on('click.foo', listener2);
                emitter.on('dummy.bar', listener3);

                emitter.emit('click');
                emitter.emit('dummy');
                emitter.off('.foo');
                emitter.off('.bar');
                emitter.emit('click');
                emitter.emit('dummy');

                expect(stack).to.eql(['listener1', 'listener2', 'listener3', 'listener1']);
            });

            it('should not error out when used with .once()', function () {
                emitter.once('foo.bar', function () {
                    emitter.off();
                });

                expect(function () {
                    emitter.emit('foo');
                }).to.not.throwException();
            });
        });

        describe('.has()', function () {
            it('should should return true for added listeners and false for not added listeners', function () {
                var someFunc = function () {},
                    otherFunc = function () {};

                expect(emitter.has('click', someFunc)).to.be.equal(false);
                expect(emitter.has('click')).to.be.equal(false);

                emitter.on('click', someFunc);
                emitter.on('click', otherFunc);

                expect(emitter.has('click', someFunc)).to.be.equal(true);
                expect(emitter.has('click', otherFunc)).to.be.equal(true);
                expect(emitter.has('click')).to.be.equal(true);
                expect(emitter.has('mouseover')).to.be.equal(false);

                emitter.off('click', someFunc);

                expect(emitter.has('click', someFunc)).to.be.equal(false);
                expect(emitter.has('click', otherFunc)).to.be.equal(true);
                expect(emitter.has('click')).to.be.equal(true);

                emitter.off('click', otherFunc);

                expect(emitter.has('click', otherFunc)).to.be.equal(false);
                expect(emitter.has('click')).to.be.equal(false);
            });

            it('should return false even if there are "junk" listeners', function () {
                var fn = function () {
                    emitter.off('click', fn);
                };

                emitter.on('click', fn);
                emitter.emit('click');

                expect(emitter.has('click')).to.be.equal(false);
            });

            it('should work with namespaces', function () {
                var someFunc = function () {},
                    otherFunc = function () {};

                emitter.on('click.foo', someFunc);
                emitter.on('click.bar', otherFunc);

                expect(emitter.has('.foo', someFunc)).to.be.equal(true);
                expect(emitter.has('.foo', otherFunc)).to.be.equal(false);
                expect(emitter.has('.bar')).to.be.equal(true);
                expect(emitter.has('.other')).to.be.equal(false);
            });
        });

        describe('.emit()', function () {
            it('should respect the order of emit calls', function () {
                var listener = function () {
                    stack.push('one');
                },
                    listener2 = function () {
                        emitter.emit('ghost');
                        emitter.emit('other');
                        stack.push('two');
                    },
                    listener3 = function () {
                        stack.push('three');
                    },
                    listener4 = function () {
                        stack.push('four');
                    };

                emitter.on('some', listener);
                emitter.on('some', listener2);
                emitter.on('some', listener3);
                emitter.on('other', listener4);

                emitter.emit('some');

                expect(stack).to.eql(['one', 'four', 'two', 'three']);
            });

            it('should call listeners added while dispatching', function () {
                var listener = function () {
                    stack.push('one');
                    emitter.on('some', listener2);
                },
                    listener2 = function () {
                        stack.push('two');
                    };

                emitter.on('some', listener);
                emitter.emit('some');
                expect(stack).to.eql(['one', 'two']);
            });

            it('should not call listeners removed while dispatching', function () {
                var listener = function () {
                    stack.push('one');
                    emitter.off('other', listener2);
                    emitter.on('other', listener5);
                },
                    listener2 = function () {
                        stack.push('two');
                    },
                    listener3 = function () {
                        emitter.off('other', listener);
                        stack.push('three');
                    },
                    listener4 = function () {
                        emitter.off('other', listener3);
                        emitter.on('other', listener6);
                        stack.push('four');
                    },
                    listener5 = function () {
                        stack.push('five');
                    },
                    listener6 = function () {
                        stack.push('six');
                    };

                emitter.on('other', listener);
                emitter.on('other', listener2);
                emitter.on('other', listener3);
                emitter.on('other', listener4);

                emitter.emit('other');
                expect(stack).to.eql(['one', 'three', 'four', 'five', 'six']);
            });

            it('should handle removing all listeners while dispatching', function () {
                var listener = function () {
                    stack.push('one');
                    emitter.off();
                },
                    listener2 = function () {
                        stack.push('two');
                    },
                    listener3 = function () {
                        stack.push('three');
                    };

                emitter.on('some', listener);
                emitter.on('some', listener2);
                emitter.on('some', listener3);

                emitter.emit('some');
                expect(stack).to.eql(['one']);

                stack = [];
                emitter.off();

                listener = function () {
                    stack.push('one');
                    emitter.off('some', listener2);
                    emitter.off('some', listener3);
                };
                listener2 = function () {
                    stack.push('two');
                };
                listener3 = function () {
                    stack.push('three');
                };

                emitter.on('some', listener);
                emitter.on('some', listener2);
                emitter.on('some', listener3);

                emitter.emit('some');
                expect(stack).to.eql(['one']);
            });

            it('should not catch any inner listener error', function () {
                emitter.on('err', function () {
                    throw new Error('dummy error');
                });

                expect(function () {
                    emitter.emit('err');
                }).to.throwException(/dummy error/);
            });

            it('should behave normally after a listener throws an error', function () {
                var listener = function () {
                    stack.push('one');
                },
                    listener2 = function () {
                        emitter.emit('other');
                        stack.push('two');
                    },
                    listener3 = function () {
                        throw new Error('dummy error');
                    },
                    listener4 = function () {
                        stack.push('four');
                    };

                emitter.on('some', listener);
                emitter.on('some', listener2);
                emitter.on('some', listener3);
                emitter.on('other', listener4);

                expect(function () {
                    emitter.emit('some');
                }).to.throwException(/dummy error/);

                expect(function () {
                    emitter.emit('some');
                }).to.throwException(/dummy error/);

                expect(stack).to.eql(['one', 'four', 'two', 'one', 'four', 'two']);
            });
        });

        describe('.forEach()', function () {
            it('should cycle through all the events', function () {
                emitter.forEach(function (event, fn) {
                    stack.push(event, fn);
                });

                var ctx = {},
                    listener = function () {
                    emitter.forEach(function (event, fn) {
                        stack.push(event, fn);
                    });
                    emitter.off('some', listener2);
                    emitter.off('some', listener3);
                    emitter.forEach(function (event, fn, context) {
                        stack.push(event, fn);

                        if (event === 'other') {
                            expect(context).to.be(ctx);
                        }
                    });

                },
                    listener2 = function () {},
                    listener3 = function () {},
                    listener4 = function () {};

                emitter.on('some', listener);
                emitter.on('some', listener2);
                emitter.on('some', listener3);
                emitter.on('other', listener4, ctx);

                emitter.emit('some');

                expect(stack).to.eql(['some', listener, 'some', listener2, 'some', listener3, 'other', listener4, 'some', listener, 'other', listener4]);
            });

            it('should be able to execute the handler with the given context', function () {
                var listener = function () {
                    stack.push(this);
                },
                    listener2 = function () {
                        stack.push(this);
                    },
                    context = {};

                emitter.on('some', listener);
                emitter.on('some', listener2, context);

                emitter.emit('some');

                expect(stack.length).to.be.eql(2);
                expect(stack[0]).to.be.eql(emitter);
                expect(stack[1]).to.be.eql(context);
            });
        });
    });
});
